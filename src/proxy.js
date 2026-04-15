import { NextResponse } from "next/server";

const PUBLIC_API_PREFIXES = ["/api/health", "/api/packages", "/api/companies"];

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const isPublicApi = PUBLIC_API_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (!pathname.startsWith("/api/") || isPublicApi) {
    return NextResponse.next();
  }

  const companyId = request.headers.get("x-company-id");
  if (!companyId) {
    return Response.json(
      {
        success: false,
        error: "x-company-id header is required for tenant-scoped endpoints",
      },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
