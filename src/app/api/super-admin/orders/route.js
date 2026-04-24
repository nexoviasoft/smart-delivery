import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Company from "@/models/Company";
import { isSuperAdminRequest } from "@/lib/super-admin";
import { apiError, apiOk } from "@/lib/http";

export async function GET(request) {
  if (!isSuperAdminRequest(request)) {
    return apiError("Unauthorized", 401);
  }

  await connectDB();

  // Fetch all orders and populate company details
  // Note: Since we are using Mongoose, we can use populate if the schema is set up,
  // but let's do a manual join or just fetch and then map if populate isn't configured for companyId.
  // Looking at Order.js might help, but let's assume standard lookup for now.
  
  const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
  
  // Fetch companies to map names
  const companyIds = [...new Set(orders.map(o => o.companyId).filter(Boolean))];
  const companies = await Company.find({ _id: { $in: companyIds } }).lean();
  const companyMap = companies.reduce((acc, c) => {
    acc[c._id.toString()] = c.name;
    return acc;
  }, {});

  const enrichedOrders = orders.map(order => ({
    ...order,
    companyName: companyMap[order.companyId?.toString()] || "Unknown"
  }));

  return apiOk(enrichedOrders);
}
