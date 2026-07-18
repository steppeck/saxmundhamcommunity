import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { userSupabase } from "./supabase";

export const adminCookie = "sax_admin_access";

export async function getAdminSession() {
  const token = (await cookies()).get(adminCookie)?.value;
  if (!token) return null;
  const client = userSupabase(token);
  const { data: userData, error } = await client.auth.getUser(token);
  if (error || !userData.user) return null;
  const { data: profile } = await client
    .from("admin_profiles")
    .select("display_name,active")
    .eq("user_id", userData.user.id)
    .eq("active", true)
    .maybeSingle();
  if (!profile) return null;
  return { token, user: userData.user, profile };
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}
