import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import Company from "@/models/Company";
import User from "@/models/User";
import Package from "@/models/Package";
import Subscription from "@/models/Subscription";
import Usage from "@/models/Usage";
import { BILLING_TYPES } from "@/lib/constants";
import { apiError, apiOk } from "@/lib/http";
import { getCurrentUsageMonth } from "@/lib/usage";

function getExpiryDate(startDate, billingType) {
  const days = billingType === "yearly" ? 365 : 30;
  return new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);
}

export async function POST(request) {
  await connectDB();
  const body = await request.json();

  const { companyName, slug, companyEmail, ownerName, ownerEmail, password } = body;
  const packageId = body.packageId;
  const billingType = body.billingType || "monthly";

  if (
    !companyName ||
    !slug ||
    !companyEmail ||
    !ownerName ||
    !ownerEmail ||
    !password ||
    !packageId
  ) {
    return apiError("Missing required fields", 400);
  }

  if (!BILLING_TYPES.includes(billingType)) {
    return apiError("Invalid billing type", 400);
  }

  const packageDoc = await Package.findById(packageId);
  if (!packageDoc || !packageDoc.isActive) {
    return apiError("Package not found", 404);
  }

  const companyExists = await Company.findOne({
    $or: [{ slug: slug.toLowerCase() }, { email: companyEmail.toLowerCase() }],
  });
  if (companyExists) {
    return apiError("Company already exists", 409);
  }

  const company = await Company.create({
    name: companyName,
    slug,
    email: companyEmail,
  });

  const passwordHash = await bcrypt.hash(password, 10);
  const owner = await User.create({
    companyId: company._id,
    name: ownerName,
    email: ownerEmail,
    passwordHash,
    role: "owner",
  });

  const startsAt = new Date();
  const subscription = await Subscription.create({
    companyId: company._id,
    packageId: packageDoc._id,
    billingType,
    startsAt,
    expiresAt: getExpiryDate(startsAt, billingType),
    status: "pending",
  });

  await Usage.create({
    companyId: company._id,
    month: getCurrentUsageMonth(),
    users: 1,
  });

  return apiOk(
    {
      company,
      ownerId: owner._id,
      subscriptionId: subscription._id,
    },
    201
  );
}
