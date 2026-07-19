import Link from "next/link";
import { requireAdmin } from "@/lib/admin-session";
import { getAdminReports } from "@/lib/admin-reports";
import { AdminNav } from "../admin-nav";
export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await requireAdmin();
  const reports = await getAdminReports(session.token);
  const { q = "" } = await searchParams;
  const shown = q
    ? reports.filter((r) => r.reference.toLowerCase().includes(q.toLowerCase()))
    : reports;
  return (
    <div className="admin-shell">
      <AdminNav name={session.profile.display_name} />
      <section className="admin-main">
        <h1>All reports</h1>
        <form role="search">
          <label htmlFor="q">Search by reference number</label>
          <input id="q" name="q" defaultValue={q} />
          <button className="button secondary">Search</button>
        </form>
        <p>{shown.length} reports</p>
        <div className="actions">
          <a className="button secondary" href="/api/admin/export">
            Export public quantitative data
          </a>
          <a
            className="button secondary"
            href="/api/admin/export?scope=private"
          >
            Export protected administrative data
          </a>
        </div>
        <div className="admin-list">
          {shown.map((r) => (
            <Link key={r.id} href={`/admin/reports/${r.id}`}>
              <strong>{r.reference}</strong>
              <span>
                {r.incidentDate} - {r.noiseType.join("; ")}
              </span>
              <span className="status">{r.status}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
