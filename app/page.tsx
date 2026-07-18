import Link from "next/link";
import { getPublicReports } from "@/lib/public-reports";
import { siteConfig } from "@/config/site";

export default async function HomePage() {
  const reports = await getPublicReports();
  const sleepReports = reports.filter((report) =>
    report.effects.some((effect) => effect.toLowerCase().includes("sleep")),
  ).length;
  const areas = new Set(reports.map((report) => report.broadArea)).size;

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
              <strong>{reports.length}</strong>
              <span>approved reports</span>
            </article>
            <article>
              <strong>{sleepReports}</strong>
              <span>mention sleep disturbance</span>
            </article>
            <article>
              <strong>{areas}</strong>
              <span>broad areas represented</span>
            </article>
          </div>
          {reports.length === 0 ? (
            <p className="muted">
              Statistics will appear after reports have been approved.
            </p>
          ) : null}
        </div>
      </section>

      <section className="plain-section">
        <div className="reading-width">
          <h2>How reports help</h2>
          <p>
            Each report records the same useful facts. Once a community
            administrator has checked it for privacy and data quality, its
            non-personal answers can be added to the public register and
            statistics.
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
