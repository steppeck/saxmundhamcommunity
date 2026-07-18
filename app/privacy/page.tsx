import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
export const metadata: Metadata = { title: "Privacy" };
export default function PrivacyPage() {
  const controller =
    siteConfig.dataController ||
    "[Owner must add the legal name before launch]";
  const contact =
    siteConfig.privacyContact ||
    "[Owner must add the privacy email before launch]";
  return (
    <section className="page-shell">
      <div className="reading-width prose">
        <p className="eyebrow">Draft privacy notice</p>
        <h1>How we use your information</h1>
        <div className="notice warning">
          <strong>Draft for owner approval</strong>
          <p>
            The controller identity, lawful basis, retention period and final
            wording must be confirmed before public launch.
          </p>
        </div>
        <h2>Who is responsible</h2>
        <p>
          The information controller is <strong>{controller}</strong>. Privacy
          questions can be sent to <strong>{contact}</strong>.
        </p>
        <h2>What we collect</h2>
        <p>
          We collect structured information about railway noise and disturbance.
          You may choose to provide your name, email address and a private
          comment. We do not ask for a full address, telephone number, date of
          birth, health diagnosis, photographs or recordings.
        </p>
        <h2>Why we collect it</h2>
        <p>
          We use reports to identify patterns, maintain an evidence record,
          check data quality and publish approved non-personal statistics.
          Contact details may be used to check a report or provide an update.
        </p>
        <h2>What is published</h2>
        <p>
          Approved structured incident answers may be published. Your name,
          email address, private comments and administrator notes are never
          published.
        </p>
        <h2>How long we keep it</h2>
        <p>
          The provisional system setting keeps optional contact details for{" "}
          {siteConfig.contactRetentionDays} days. This is a configurable
          default, not legal advice. The owner must approve the final period. An
          anonymised incident record may be retained for the evidence series.
        </p>
        <h2>Your rights</h2>
        <p>
          You may ask for access to your personal information, correction or
          deletion. Include your report reference when contacting {contact}.
        </p>
        <h2>Service providers</h2>
        <p>
          Supabase hosts the database and authentication. Netlify hosts the
          website. GitHub stores source code and must not contain report data or
          secrets.
        </p>
        <h2>Automated decisions</h2>
        <p>
          The service does not use AI or automated decision-making to approve or
          reject reports.
        </p>
      </div>
    </section>
  );
}
