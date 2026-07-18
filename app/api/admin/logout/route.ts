import { NextResponse } from "next/server";
import { adminCookie } from "@/lib/admin-session";

export async function POST(request: Request) {
  const response = NextResponse.redirect(
    new URL("/admin/login", request.url),
    303,
  );
  response.cookies.set(adminCookie, "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });
  return response;
}
