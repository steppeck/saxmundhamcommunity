import { NextResponse } from "next/server";
import { adminCookie } from "@/lib/admin-session";
import { publicSupabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json(
      { error: "Enter your email and password." },
      { status: 400 },
    );
  }
  const client = publicSupabase();
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });
  if (error || !data.session || !data.user) {
    return NextResponse.json(
      { error: "The email or password was not recognised." },
      { status: 401 },
    );
  }
  const { data: profile } = await client
    .from("admin_profiles")
    .select("active")
    .eq("user_id", data.user.id)
    .eq("active", true)
    .maybeSingle();
  if (!profile) {
    return NextResponse.json(
      { error: "This account is not an active administrator." },
      { status: 403 },
    );
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminCookie, data.session.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.max(data.session.expires_in - 60, 60),
  });
  return response;
}
