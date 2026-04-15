import mongoose from "mongoose";
import { getSessionFromRequest } from "@/lib/session";

export function getRequestContext(request) {
  const session = getSessionFromRequest(request);
  const companyId = request.headers.get("x-company-id") || session?.companyId || null;
  const userId = request.headers.get("x-user-id") || session?.userId || null;
  const userRole = request.headers.get("x-user-role") || session?.userRole || null;

  return {
    companyId,
    userId,
    userRole,
  };
}

export function assertTenantContext(request) {
  const context = getRequestContext(request);

  if (!context.companyId || !mongoose.Types.ObjectId.isValid(context.companyId)) {
    return { error: "Missing or invalid company context", status: 401 };
  }

  return { context };
}
