import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { ReportForm } from "./report-form";

export const metadata: Metadata = { title: "Report railway noise" };

export default function ReportPage() {
  return (
    <section className="page-shell">
      <div className="reading-width">
        <div className="page-heading">
          <p className="eyebrow">Report railway noise</p>
          <h1>Tell us what happened</h1>
          <p className="lead">
            The form takes one question at a time. You can go back without
            losing your answers.
          </p>
          <div className="notice emergency">
            <strong>Immediate danger?</strong>
            <p>{siteConfig.emergency}</p>
          </div>
        </div>
        <ReportForm />
      </div>
    </section>
  );
}
