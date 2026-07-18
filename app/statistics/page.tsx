import type { Metadata } from "next";
import { getPublicReports } from "@/lib/public-reports";
import type { PublicReport } from "@/lib/types";

export const metadata: Metadata = { title: "Statistics" };

const dimensions: Array<[string, string, (report: PublicReport) => string[]]> =
  [
    [
      "Reports by broad location",
      "Shows which broad areas appear most often in approved reports.",
      (r) => [r.broadArea],
    ],
    [
      "Reports by time of day",
      "Shows when approved incidents were experienced.",
      (r) => [r.timePeriod],
    ],
    [
      "Reports by noise type",
      "Shows the kinds of noise and disturbance selected by residents.",
      (r) => [r.noiseType],
    ],
    [
      "Reports by duration",
      "Shows how long reported incidents lasted.",
      (r) => [r.duration],
    ],
    [
      "Indoor and outdoor disturbance",
      "Shows where residents experienced the disturbance.",
      (r) => [r.experiencedAt],
    ],
    [
      "Reported disruption levels",
      "Shows residents' overall assessment of disruption.",
      (r) => [r.disruptionLevel],
    ],
    [
      "Frequency of recurring disturbance",
      "Shows how often residents say this type of disturbance occurs.",
      (r) => [r.frequency],
    ],
  ];

export default async function StatisticsPage() {
  const reports = await getPublicReports();
  const sleep = reports.filter((r) =>
    r.effects.some((e) => e.toLowerCase().includes("sleep")),
  ).length;
  const byMonth = count(reports, (r) => [r.incidentDate.slice(0, 7)]);
  return (
    <section className="page-shell">
      <div className="page-width">
        <div className="page-heading">
          <p className="eyebrow">Approved public data</p>
          <h1>What residents have reported</h1>
          <p className="lead">
            Simple summaries of approved, non-personal reports. These figures
            update when administrators approve or remove a report.
          </p>
        </div>
        <div className="headline-stats">
          <article>
            <strong>{reports.length}</strong>
            <span>approved reports</span>
          </article>
          <article>
            <strong>{sleep}</strong>
            <span>involving sleep disturbance</span>
          </article>
          <article>
            <strong>
              {reports.length ? Math.round((sleep / reports.length) * 100) : 0}%
            </strong>
            <span>of reports involving sleep</span>
          </article>
        </div>
        <Chart
          title="Reports over time"
          summary="Approved reports grouped by incident month."
          values={byMonth}
        />
        {dimensions.map(([title, summary, selector]) => (
          <Chart
            key={title}
            title={title}
            summary={summary}
            values={count(reports, selector)}
          />
        ))}
      </div>
    </section>
  );
}
function count(
  reports: PublicReport[],
  selector: (report: PublicReport) => string[],
) {
  const result: Record<string, number> = {};
  reports.forEach((report) =>
    selector(report).forEach((key) => {
      result[key] = (result[key] || 0) + 1;
    }),
  );
  return Object.entries(result).sort((a, b) => b[1] - a[1]);
}
function Chart({
  title,
  summary,
  values,
}: {
  title: string;
  summary: string;
  values: Array<[string, number]>;
}) {
  const max = Math.max(...values.map(([, value]) => value), 1);
  return (
    <section className="chart-section">
      <h2>{title}</h2>
      <p>
        {summary}{" "}
        {values.length
          ? `The largest group is ${values[0][0]} with ${values[0][1]} reports.`
          : "There is no approved data yet."}
      </p>
      {values.length ? (
        <>
          <div
            className="bars"
            role="img"
            aria-label={`${title}. See data table below.`}
          >
            {values.map(([label, value]) => (
              <div className="bar-row" key={label}>
                <span>{label}</span>
                <div className="bar-track" aria-hidden="true">
                  <div
                    className="bar"
                    style={{ width: `${(value / max) * 100}%` }}
                  />
                </div>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          <table>
            <caption className="sr-only">{title} data</caption>
            <thead>
              <tr>
                <th scope="col">Category</th>
                <th scope="col">Reports</th>
              </tr>
            </thead>
            <tbody>
              {values.map(([label, value]) => (
                <tr key={label}>
                  <th scope="row">{label}</th>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : null}
    </section>
  );
}
