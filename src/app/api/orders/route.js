import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Delivery from "@/models/Delivery";
import { assertTenantContext } from "@/lib/auth-context";
import { assertSubscriptionAccess } from "@/lib/guards";
import { incrementUsage } from "@/lib/usage";
import { apiError, apiOk } from "@/lib/http";

export async function GET(request) {
  const auth = assertTenantContext(request);
  if (auth.error) return apiError(auth.error, auth.status);

  await connectDB();
  const access = await assertSubscriptionAccess({
    companyId: auth.context.companyId,
    featureKey: "order_system",
  });
  if (access.error) return apiError(access.error, access.status, access.meta);

  const orders = await Order.find({ companyId: auth.context.companyId }).sort({
    createdAt: -1,
  });
  return apiOk(orders);
}

export async function POST(request) {
  const auth = assertTenantContext(request);
  if (auth.error) return apiError(auth.error, auth.status);

  const body = await request.json();
  const required = [
    "orderNumber",
    "customerName",
    "customerPhone",
    "customerAddress",
    "codAmount",
  ];
  const missingField = required.find((field) => !body?.[field] && body?.[field] !== 0);
  if (missingField) return apiError(`Missing field '${missingField}'`, 400);

  await connectDB();
  const access = await assertSubscriptionAccess({
    companyId: auth.context.companyId,
    featureKey: "order_system",
    limitKey: "orders_per_month",
    incrementBy: 1,
  });
  if (access.error) return apiError(access.error, access.status, access.meta);

  const order = await Order.create({
    companyId: auth.context.companyId,
    orderNumber: body.orderNumber,
    customerName: body.customerName,
    customerPhone: body.customerPhone,
    customerAddress: body.customerAddress,
    codAmount: Number(body.codAmount),
    notes: body.notes || "",
  });

  await Delivery.create({
    companyId: auth.context.companyId,
    orderId: order._id,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerAddress: order.customerAddress,
    codAmount: order.codAmount,
    status: "pending",
  });

  await incrementUsage(auth.context.companyId, "orders", 1);
  return apiOk(order, 201);
}
