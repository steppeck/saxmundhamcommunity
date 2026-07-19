import type { Metadata } from "next";
import { getPublicSubmissionSummary } from "@/lib/public-summary";
import { siteConfig } from "@/config/site";
import { ShareLinks } from "../share-links";

export const metadata: Metadata = { title: "Public reports" };
export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const summary = await getPublicSubmissionSummary();
  const today = new Date();
  const currentMonth = monthKey(today);

  const timeline = monthsThisYear(today).map((key) => ({
    key,
    label: formatMonth(key),
    count: summary.byMonth[key] || 0,
  }));
  const largestCount = Math.max(...timeline.map((month) => month.count), 1);
  const noiseTypes = Object.entries(summary.byNoiseType).sort(
    (a, b) => b[1] - a[1],
  );

  return (
    <section className="page-shell">
      <div className="page-width">
        <div className="page-heading">
          <p className="eyebrow">Anonymous community data</p>
          <h1>Public report overview</h1>
          <p className="lead">
            Anonymous totals update when a valid report is submitted. No
            personal details or individual reports appear here.
          </p>
        </div>

        <div className="headline-stats" aria-label="Report totals">
          <article>
            <strong>{summary.total}</strong>
            <span>reports contributing to totals</span>
          </article>
          <article>
            <strong>{summary.lastThirtyDays}</strong>
            <span>in the last 30 days</span>
          </article>
          <article>
            <strong>{summary.thisMonth}</strong>
            <span>in {formatMonth(currentMonth)}</span>
          </article>
        </div>

        <section className="chart-section" aria-labelledby="timeline-heading">
          <h2 id="timeline-heading">Reports by month</h2>
          <p>
            The graph covers this year to date and uses the date when each
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
            {summary.latestMonth
              ? `Most recent report month: ${formatMonth(summary.latestMonth)}.`
              : "There are no reports yet."}
          </p>
        </section>

        <section className="chart-section" aria-labelledby="types-heading">
          <h2 id="types-heading">Types of disturbance reported</h2>
          <p>
            A report can include more than one type, so these totals may add up
            to more than the number of reports.
          </p>
          {noiseTypes.length ? (
            <ol
              className="disturbance-block-chart"
              aria-label="Disturbance type totals"
            >
              {noiseTypes.map(([label, count]) => (
                <li key={label}>
                  <div className="block-chart-label">
                    <span>{label}</span>
                    <strong>{count}</strong>
                  </div>
                  <div className="count-blocks" aria-hidden="true">
                    {Array.from({ length: count }, (_, index) => (
                      <span className="count-block" key={index} />
                    ))}
                  </div>
                  <span className="sr-only">
                    {label}: {count}
                  </span>
                  <span className="block-chart-key">
                    Each block represents one report selection.
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p>There are no disturbance types to show yet.</p>
          )}
        </section>

        <div className="notice">
          <p>
            These are grouped counts from structured answers. Names, email
            addresses, private comments, street names, report references and
            individual records are not included.
          </p>
          <p>{siteConfig.publicStatus}</p>
        </div>
        <section className="share-section" aria-labelledby="share-heading">
          <h2 id="share-heading">Share this timeline</h2>
          <ShareLinks
            title="Saxmundham railway disturbance timeline"
            text="See the anonymous overview of railway disturbance reports in Saxmundham."
            url={`${siteConfig.publicUrl}/reports`}
          />
        </section>
      </div>
    </section>
  );
}

function monthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function monthsThisYear(date: Date) {
  return Array.from({ length: date.getUTCMonth() + 1 }, (_, index) => {
    const month = new Date(Date.UTC(date.getUTCFullYear(), index, 1));
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
