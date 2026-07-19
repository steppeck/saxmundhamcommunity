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
            <h2>The report stays private</h2>
            <p>
              Every new report is marked pending. It does not appear in the
              public register or statistics.
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
            <h2>Approved facts are published</h2>
            <p>
              Only structured, non-personal answers from approved reports appear
              publicly. Free-text comments are never published.
            </p>
          </li>
          <li>
            <h2>Patterns become visible</h2>
            <p>
              The reports page, CSV and statistics show recurring times, areas,
              noise types and effects.
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
