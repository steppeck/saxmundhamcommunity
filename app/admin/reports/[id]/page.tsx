import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-session";
import { getAdminReports } from "@/lib/admin-reports";
import { ModerationForm } from "./moderation-form";
export default async function AdminReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAdmin();
  const { id } = await params;
  const report = (await getAdminReports(session.token, id))[0];
  if (!report) notFound();
  return (
    <div className="admin-shell">
      <section className="admin-main">
        <p className="eyebrow">{report.reference}</p>
        <h1>Review report</h1>
        <div className="admin-detail">
          <div>
            <h2>Structured answers</h2>
            <dl className="review-list">
              {Object.entries({
                "Incident date": report.incidentDate,
                "Approximate time": report.approximateTime,
                Area: report.broadArea,
                "Street name": report.streetName || "Not provided",
                "Noise types": report.noiseType.join("; "),
                Duration: report.duration,
                Experienced: report.experiencedAt,
                "Window position": report.windowState || "Not applicable",
                Effects: report.effects.join("; "),
                Disruption: report.disruptionLevel,
                Frequency: report.frequency,
                "Report timing": report.reportTiming,
              }).map(([term, value]) => (
                <div className="review-row" key={term}>
                  <dt>{term}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <section className="private-panel">
              <h2>Private information</h2>
              <p>
                <strong>Name:</strong> {report.reporterName || "Not provided"}
              </p>
              <p>
                <strong>Email:</strong> {report.reporterEmail || "Not provided"}
              </p>
              <p>
                <strong>Private comments:</strong>{" "}
                {report.privateComments || "None"}
              </p>
            </section>
          </div>
          <ModerationForm report={report} />
        </div>
        <section>
          <h2>Audit history</h2>
          {report.history?.length ? (
            <table>
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Action</th>
                  <th scope="col">Status</th>
                  <th scope="col">Internal reason</th>
                </tr>
              </thead>
              <tbody>
                {report.history.map((item) => (
                  <tr key={`${item.createdAt}-${item.action}`}>
                    <td>{new Date(item.createdAt).toLocaleString("en-GB")}</td>
                    <td>{item.action}</td>
                    <td>{item.toStatus || ""}</td>
                    <td>{item.reason || ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No audit entries are available.</p>
          )}
        </section>
      </section>
    </div>
  );
}
