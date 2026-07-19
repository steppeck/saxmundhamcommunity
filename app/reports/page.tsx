import type { Metadata } from "next";
import { getPublicReports } from "@/lib/public-reports";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = { title: "Public reports" };
export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const reports = await getPublicReports();
  const today = new Date();
  const currentMonth = monthKey(today);
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 29);
  thirtyDaysAgo.setUTCHours(0, 0, 0, 0);

  const timeline = recentMonths(today, 12).map((key) => ({
    key,
    label: formatMonth(key),
    count: reports.filter((report) => report.incidentDate.startsWith(key))
      .length,
  }));
  const largestCount = Math.max(...timeline.map((month) => month.count), 1);
  const thisMonth = reports.filter((report) =>
    report.incidentDate.startsWith(currentMonth),
  ).length;
  const lastThirtyDays = reports.filter(
    (report) => new Date(`${report.incidentDate}T00:00:00Z`) >= thirtyDaysAgo,
  ).length;
  const latestDate = reports
    .map((report) => report.incidentDate)
    .sort()
    .at(-1);

  return (
    <section className="page-shell">
      <div className="page-width">
        <div className="page-heading">
          <p className="eyebrow">Approved public data</p>
          <h1>Report timeline</h1>
          <p className="lead">
            A simple view of when approved railway disturbance reports took
            place.
          </p>
        </div>

        <div className="headline-stats" aria-label="Report totals">
          <article>
            <strong>{reports.length}</strong>
            <span>approved reports in total</span>
          </article>
          <article>
            <strong>{lastThirtyDays}</strong>
            <span>in the last 30 days</span>
          </article>
          <article>
            <strong>{thisMonth}</strong>
            <span>in {formatMonth(currentMonth)}</span>
          </article>
        </div>

        <section className="chart-section" aria-labelledby="timeline-heading">
          <h2 id="timeline-heading">Reports by month</h2>
          <p>
            The graph covers the latest 12 months and uses the date when each
            disturbance took place.
          </p>
          <ol className="bars timeline-bars" aria-label="Monthly report totals">
            {timeline.map((month) => (
              <li className="bar-row" key={month.key}>
                <span>{month.label}</span>
                <div className="bar-track" aria-hidden="true">
                  <div
                    className="bar"
                    data-zero={month.count === 0}
                    style={{
                      width: `${(month.count / largestCount) * 100}%`,
                    }}
                  />
                </div>
                <strong>
                  <span className="sr-only">{month.label}: </span>
                  {month.count}
                </strong>
              </li>
            ))}
          </ol>
          <p className="timeline-latest">
            {latestDate
              ? `Most recent approved incident: ${formatDate(latestDate)}.`
              : "There are no approved reports yet."}
          </p>
        </section>

        <div className="notice">
          <p>{siteConfig.publicStatus}</p>
        </div>
      </div>
    </section>
  );
}

function monthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function recentMonths(date: Date, count: number) {
  return Array.from({ length: count }, (_, index) => {
    const month = new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth() - (count - index - 1),
        1,
      ),
    );
    return monthKey(month);
  });
}

function formatMonth(key: string) {
  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${key}-01T00:00:00Z`));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}
