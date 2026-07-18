import { NextRequest, NextResponse } from "next/server";

const adminCookie = "sax_admin_access";

export function middleware(request: NextRequest) {
  if (!request.cookies.has(adminCookie)) {
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/reports/:path*"],
};
