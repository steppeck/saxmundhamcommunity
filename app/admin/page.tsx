import { requireAdmin } from "@/lib/admin-session";
import { getAdminReports } from "@/lib/admin-reports";
import { AdminNav } from "./admin-nav";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await requireAdmin();
  const reports = await getAdminReports(session.token);
  const total = (status: string) =>
    reports.filter((r) => r.status === status).length;
  return (
    <div className="admin-shell">
      <AdminNav name={session.profile.display_name} />
      <section className="admin-main">
        <h1>Report dashboard</h1>
        <p>
          Review new reports and decide which structured answers can contribute
          to public statistics.
        </p>
        <div className="admin-totals">
          {["pending", "approved", "duplicate", "excluded"].map((status) => (
            <article key={status}>
              <strong>{total(status)}</strong>
              <span>{status} reports</span>
            </article>
          ))}
        </div>
        <h2>Recent submissions</h2>
        <div className="admin-list">
          {reports.slice(0, 8).map((r) => (
            <Link key={r.id} href={`/admin/reports/${r.id}`}>
              <strong>{r.reference}</strong>
              <span>{r.noiseType.join("; ")}</span>
              <span className="status">{r.status}</span>
            </Link>
          ))}
        </div>
        <div className="actions">
          <Link className="button secondary" href="/admin/reports">
            View all reports
          </Link>
        </div>
      </section>
    </div>
  );
}
