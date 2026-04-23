import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import Company from "@/models/Company";
import User from "@/models/User";
import Package from "@/models/Package";
import Subscription from "@/models/Subscription";
import Usage from "@/models/Usage";
<<<<<<< HEAD
=======
import { BILLING_TYPES } from "@/lib/constants";
>>>>>>> 790594a (update)
import { apiError, apiOk } from "@/lib/http";
import { getCurrentUsageMonth } from "@/lib/usage";

function getExpiryDate(startDate, billingType) {
  const days = billingType === "yearly" ? 365 : 30;
  return new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);
}

<<<<<<< HEAD
function makeBaseSlug(name = "") {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function makeUniqueSlug(companyName) {
  const base = makeBaseSlug(companyName) || "company";
  let slug = base;
  let suffix = 1;

  while (await Company.exists({ slug })) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

=======
>>>>>>> 790594a (update)
export async function POST(request) {
  await connectDB();
  const body = await request.json();

<<<<<<< HEAD
  const { companyName, companyEmail, phone, password } = body;
  const packageId = body.packageId;
  const billingType = "monthly";

  if (!companyName || !companyEmail || !phone || !password || !packageId) {
    return apiError("Missing required fields", 400);
  }

=======
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

>>>>>>> 790594a (update)
  const packageDoc = await Package.findById(packageId);
  if (!packageDoc || !packageDoc.isActive) {
    return apiError("Package not found", 404);
  }

<<<<<<< HEAD
  const normalizedEmail = companyEmail.toLowerCase();
  const companyExists = await Company.findOne({ email: normalizedEmail });
=======
  const companyExists = await Company.findOne({
    $or: [{ slug: slug.toLowerCase() }, { email: companyEmail.toLowerCase() }],
  });
>>>>>>> 790594a (update)
  if (companyExists) {
    return apiError("Company already exists", 409);
  }

<<<<<<< HEAD
  const slug = await makeUniqueSlug(companyName);
  const company = await Company.create({
    name: companyName,
    slug,
    email: normalizedEmail,
    phone,
    ownerEmail: normalizedEmail,
=======
  const company = await Company.create({
    name: companyName,
    slug,
    email: companyEmail,
>>>>>>> 790594a (update)
  });

  const passwordHash = await bcrypt.hash(password, 10);
  const owner = await User.create({
    companyId: company._id,
<<<<<<< HEAD
    name: companyName,
    email: normalizedEmail,
=======
    name: ownerName,
    email: ownerEmail,
>>>>>>> 790594a (update)
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
