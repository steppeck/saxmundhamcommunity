import type { Metadata } from "next";
import { getPublicReports } from "@/lib/public-reports";
import { siteConfig } from "@/config/site";
import { ReportsRegister } from "./reports-register";

export const metadata: Metadata = { title: "Public reports" };

export default async function ReportsPage() {
  const reports = await getPublicReports();
  return (
    <section className="page-shell">
      <div className="page-width">
        <div className="page-heading">
          <p className="eyebrow">Public register</p>
          <h1>Reports from residents</h1>
          <p className="lead">
            Approved non-personal reports are shown here. Names, emails and
            private comments are never included.
          </p>
          <div className="notice">
            <p>{siteConfig.publicStatus}</p>
          </div>
        </div>
        <ReportsRegister reports={reports} />
      </div>
    </section>
  );
}
