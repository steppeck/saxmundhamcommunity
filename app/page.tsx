import Link from "next/link";
import { getPublicSubmissionSummary } from "@/lib/public-summary";
import { siteConfig } from "@/config/site";

export default async function HomePage() {
  const summary = await getPublicSubmissionSummary();

  return (
    <>
      <section className="home-intro">
        <div className="content-width">
          <p className="eyebrow">Community evidence for Saxmundham</p>
          <h1>Report railway noise and disturbance</h1>
          <p className="lead">{siteConfig.description}</p>
          <div className="actions">
            <Link className="button primary" href="/report">
              Report railway noise
            </Link>
            <Link className="text-link" href="/reports">
              See what residents have reported
            </Link>
          </div>
          <p className="community-note">{siteConfig.communityStatement}</p>
        </div>
      </section>

      <section className="stats-band" aria-labelledby="headline-statistics">
        <div className="content-width">
          <h2 id="headline-statistics">Reports at a glance</h2>
          <div className="headline-stats">
            <article>
              <strong>{summary.total}</strong>
              <span>reports in anonymous totals</span>
            </article>
            <article>
              <strong>{summary.sleepReports}</strong>
              <span>mention sleep disturbance</span>
            </article>
            <article>
              <strong>{summary.areasRepresented}</strong>
              <span>broad areas represented</span>
            </article>
          </div>
          {summary.total === 0 ? (
            <p className="muted">
              Anonymous statistics will appear after the first valid report.
            </p>
          ) : null}
        </div>
      </section>

      <section className="plain-section">
        <div className="reading-width">
          <h2>How reports help</h2>
          <p>
            Each report records the same useful facts. Structured answers
            contribute to anonymous grouped totals straight away. Individual
            reports still require an administrator check before publication.
          </p>
          <p>
            Reports are resident accounts and may not have been independently
            verified. The project shows patterns without publishing names, email
            addresses or private comments.
          </p>
          <div className="notice emergency">
            <strong>Not an emergency service</strong>
            <p>{siteConfig.emergency}</p>
          </div>
          <Link className="button secondary" href="/how-it-works">
            Read how the project works
          </Link>
        </div>
      </section>
    </>
  );
}
