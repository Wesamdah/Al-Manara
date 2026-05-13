import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ADMIN_ROUTES = [
  "/admin/login",
  "/admin/forgot-password",
  "/admin/reset-password",
];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const locale = pathname.split("/")[1];

  const pathWithoutLocale = pathname.replace(`/${locale}`, "");

  const isPublicRoute = PUBLIC_ADMIN_ROUTES.some((route) =>
    pathWithoutLocale.startsWith(route),
  );

  const adminToken = request.cookies.get("admin_token")?.value;

  // Not Logged In

  if (!adminToken && !isPublicRoute) {
    return NextResponse.redirect(
      new URL(`/${locale}/admin/login`, request.url),
    );
  }

  // Logged In

  if (adminToken && isPublicRoute) {
    return NextResponse.redirect(
      new URL(`/${locale}/admin/dashboard`, request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:locale/admin/:path*"],
};
