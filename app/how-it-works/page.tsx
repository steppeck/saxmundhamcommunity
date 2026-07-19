import type { Metadata } from "next";
export const metadata: Metadata = { title: "How it works" };
export default function HowItWorksPage() {
  return (
    <section className="page-shell">
      <div className="reading-width prose">
        <p className="eyebrow">About the project</p>
        <h1>How reports become useful evidence</h1>
        <p className="lead">
          The project collects consistent resident accounts while keeping
          personal details private.
        </p>
        <ol className="step-list">
          <li>
            <h2>A resident submits a report</h2>
            <p>
              The form records structured facts about the incident. A name,
              email and private comment are optional.
            </p>
          </li>
          <li>
            <h2>The individual report stays private</h2>
            <p>
              Every new report is marked pending. The individual record does not
              appear publicly, but its structured answers contribute immediately
              to anonymous grouped totals.
            </p>
          </li>
          <li>
            <h2>A community administrator reviews it</h2>
            <p>
              The administrator checks for accidental personal information,
              possible duplicate flags and obvious data errors. Approve for
              public is selected by default, but an administrator must confirm
              publication. This review is for data quality and privacy, not to
              suppress inconvenient reports.
            </p>
          </li>
          <li>
            <h2>Anonymous patterns appear immediately</h2>
            <p>
              The public overview receives counts by month, broad area and
              disturbance type. It cannot receive names, emails, comments,
              street names, references, IDs or individual records.
            </p>
          </li>
          <li>
            <h2>Approved reports support more detailed evidence</h2>
            <p>
              Administrator approval is still required before an individual
              report can enter the more detailed public evidence data. Free-text
              comments are never published.
            </p>
          </li>
        </ol>
        <h2>What this project is not</h2>
        <p>
          It is not a council service, a Network Rail service, an emergency
          service or a system for independently verifying every resident
          account.
        </p>
      </div>
    </section>
  );
}
