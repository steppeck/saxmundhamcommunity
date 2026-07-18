import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-session";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Administrator login" };
export default async function AdminLoginPage() {
  if (await getAdminSession()) redirect("/admin");
  return (
    <section className="page-shell">
      <div className="reading-width">
        <div className="page-heading">
          <p className="eyebrow">Private administration</p>
          <h1>Administrator login</h1>
          <p>
            Only approved community administrators can view private report
            information.
          </p>
        </div>
        <LoginForm />
      </div>
    </section>
  );
}
