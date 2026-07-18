"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type IncidentStatus = "Pending" | "Reviewed" | "Ready to send";

type Incident = {
  id: string;
  reference: string;
  date: string;
  time: string;
  location: string;
  category: string;
  impact: string;
  description: string;
  reporterName: string;
  reporterEmail: string;
  postcode: string;
  consentNetworkRail: boolean;
  consentCouncil: boolean;
  consentMp: boolean;
  status: IncidentStatus;
  createdAt?: string;
};

type SubmitState = "idle" | "saving" | "saved" | "error";
type AdminState = "locked" | "loading" | "ready" | "error";

const categories = [
  "Overnight noise",
  "Poor notice",
  "Blocked access",
  "Level crossing",
  "Vibration",
  "Safety concern",
  "Litter or damage",
  "Other",
];

const seedIncidents: Incident[] = [
  {
    id: "seed-1",
    reference: "SAX-2026-001",
    date: "2026-07-12",
    time: "01:40",
    location: "Station approach",
    category: "Overnight noise",
    impact: "Sleep disruption for nearby homes",
    description:
      "Repeated machinery noise after midnight, with no leaflet or prior notice received by the household.",
    reporterName: "Resident A",
    reporterEmail: "resident@example.org",
    postcode: "IP17",
    consentNetworkRail: true,
    consentCouncil: true,
    consentMp: true,
    status: "Ready to send",
  },
  {
    id: "seed-2",
    reference: "SAX-2026-002",
    date: "2026-07-13",
    time: "08:15",
    location: "Level crossing",
    category: "Level crossing",
    impact: "Delayed school and care journeys",
    description:
      "Crossing remained down longer than expected during the morning peak, with traffic backing up through the centre.",
    reporterName: "Resident B",
    reporterEmail: "resident@example.org",
    postcode: "IP17",
    consentNetworkRail: true,
    consentCouncil: true,
    consentMp: false,
    status: "Reviewed",
  },
  {
    id: "seed-3",
    reference: "SAX-2026-003",
    date: "2026-07-15",
    time: "23:50",
    location: "South entrance",
    category: "Poor notice",
    impact: "Business opening disrupted",
    description:
      "Works vehicles arrived late at night. Nearby traders had not been given practical notice of access changes.",
    reporterName: "Business owner",
    reporterEmail: "business@example.org",
    postcode: "IP17",
    consentNetworkRail: true,
    consentCouncil: true,
    consentMp: true,
    status: "Pending",
  },
];

const blankIncident = {
  date: "",
  time: "",
  location: "",
  category: "Overnight noise",
  impact: "",
  description: "",
  reporterName: "",
  reporterEmail: "",
  postcode: "",
  consentNetworkRail: true,
  consentCouncil: true,
  consentMp: true,
};

export default function Home() {
  const [publicIncidents, setPublicIncidents] = useState<Incident[]>(seedIncidents);
  const [adminIncidents, setAdminIncidents] = useState<Incident[]>([]);
  const [form, setForm] = useState(blankIncident);
  const [selectedId, setSelectedId] = useState(seedIncidents[0].id);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [adminState, setAdminState] = useState<AdminState>("locked");
  const [adminMessage, setAdminMessage] = useState("");
  const [viewer, setViewer] = useState("");
  const [toast, setToast] = useState("");

  const incidents = adminIncidents.length ? adminIncidents : publicIncidents;
  const selected = incidents.find((incident) => incident.id === selectedId) || incidents[0];

  const stats = useMemo(() => {
    const overnight = incidents.filter((i) => i.category === "Overnight noise");
    const safety = incidents.filter((i) => i.category === "Safety concern");
    const ready = incidents.filter((i) => i.status === "Ready to send");
    const consented = incidents.filter(
      (i) => i.consentCouncil || i.consentMp || i.consentNetworkRail,
    );

    return {
      total: incidents.length,
      overnight: overnight.length,
      safety: safety.length,
      ready: ready.length,
      consented: consented.length,
    };
  }, [incidents]);

  useEffect(() => {
    if (selected && !incidents.some((incident) => incident.id === selectedId)) {
      setSelectedId(selected.id);
    }
  }, [incidents, selected, selectedId]);

  async function submitIncident(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState("saving");

    try {
      const response = await fetch("/api/incidents", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "The incident could not be saved.");
      }

      const incident = data.incident as Incident;
      setPublicIncidents((current) => [incident, ...current]);
      setSelectedId(incident.id);
      setForm(blankIncident);
      setSubmitState("saved");
      showToast(`${incident.reference} saved to Supabase`);
    } catch (error) {
      setSubmitState("error");
      showToast(error instanceof Error ? error.message : "The incident could not be saved.");
    }
  }

  async function loadAdminIncidents() {
    setAdminState("loading");
    setAdminMessage("");

    try {
      const response = await fetch("/api/incidents", { method: "GET" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Admin incident list could not be loaded.");
      }

      const rows = data.incidents as Incident[];
      setAdminIncidents(rows);
      setViewer(data.viewer?.email || "Workspace user");
      setSelectedId(rows[0]?.id || selectedId);
      setAdminState("ready");
      showToast("Admin reports loaded from Supabase");
    } catch (error) {
      setAdminState("error");
      setAdminMessage(
        error instanceof Error
          ? error.message
          : "Admin access requires workspace authentication.",
      );
    }
  }

  function exportCsv() {
    const rows = [
      [
        "reference",
        "date",
        "time",
        "location",
        "category",
        "impact",
        "status",
        "network_rail_consent",
        "council_consent",
        "mp_consent",
      ],
      ...incidents.map((incident) => [
        incident.reference,
        incident.date,
        incident.time,
        incident.location,
        incident.category,
        incident.impact,
        incident.status,
        incident.consentNetworkRail,
        incident.consentCouncil,
        incident.consentMp,
      ]),
    ];

    const csv = rows
      .map((row) =>
        row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sax-rail-watch-incidents.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3000);
  }

  const complaintDraft = selected
    ? `Subject: ${selected.reference} - Saxmundham rail incident evidence

Dear recipient,

This is a structured incident report submitted through the Saxmundham Rail Watch evidence log.

Reference: ${selected.reference}
Date and time: ${selected.date} at ${selected.time}
Location: ${selected.location}
Category: ${selected.category}
Reported impact: ${selected.impact}

Incident account:
${selected.description}

Consent recorded:
Network Rail: ${selected.consentNetworkRail ? "Yes" : "No"}
Saxmundham Town Council: ${selected.consentCouncil ? "Yes" : "No"}
Jenny Riddell-Carpenter MP: ${selected.consentMp ? "Yes" : "No"}

Reporter details are visible only in the authenticated admin view and should be shared strictly according to the recorded consent choices.`
    : "";

  return (
    <main>
      <section className="appShell" id="top">
        <aside className="sideNav" aria-label="Primary navigation">
          <a className="brand" href="#top" aria-label="Saxmundham Rail Watch">
            <span className="brandMark">SR</span>
            <span>Saxmundham Rail Watch</span>
          </a>
          <nav>
            <a href="#report">Report</a>
            <a href="#evidence">Evidence</a>
            <a href="#admin">Admin</a>
            <a href="#privacy">Controls</a>
          </nav>
          <div className="systemCard">
            <span>Backend</span>
            <strong>Supabase API</strong>
            <small>Server-only credentials</small>
          </div>
        </aside>

        <section className="workspace">
          <header className="hero">
            <div className="heroCopy">
              <p className="eyebrow">Resident evidence platform</p>
              <h1>Saxmundham Rail Watch</h1>
              <p>
                Log rail disruption, separate consent from evidence, and build a
                reviewed case file for Network Rail, Saxmundham Town Council and
                Jenny Riddell-Carpenter MP.
              </p>
              <div className="heroActions">
                <a className="button primary" href="#report">
                  Log an incident
                </a>
                <a className="button secondary" href="#admin">
                  Open admin queue
                </a>
              </div>
            </div>
            <div className="signalPanel" aria-label="Current evidence summary">
              <span className="panelLabel">Current evidence reference</span>
              <strong>{selected?.reference || "SAX-2026-000"}</strong>
              <div className="trackGraphic" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
              </div>
              <div className="signalStats">
                <span>
                  <strong>{stats.total}</strong>
                  reports
                </span>
                <span>
                  <strong>{stats.ready}</strong>
                  ready
                </span>
                <span>
                  <strong>{stats.safety}</strong>
                  safety
                </span>
              </div>
            </div>
          </header>

          <section className="section workflowBand" aria-label="Platform workflow">
            {[
              ["01", "Resident report", "Structured incident facts, contact details and consent are posted to Supabase."],
              ["02", "Workspace review", "Admin reads require authenticated workspace access before private reports load."],
              ["03", "Evidence pack", "Moderated reports become exportable complaint drafts and CSV evidence."],
              ["04", "Case building", "Patterns, references and repeated impacts can support a measured campaign."],
            ].map(([step, title, text]) => (
              <article className="workflowItem" key={step}>
                <span>{step}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </section>

          <section className="section split" id="report">
            <div className="sectionHeading stickyHeading">
              <p className="eyebrow">Public intake</p>
              <h2>Log a new incident</h2>
              <p>
                Submissions are sent to the secure server endpoint, which writes
                to Supabase using server-side credentials. Reporter details are
                not exposed in public page code.
              </p>
              <div className={`statusPill ${submitState}`}>
                {submitState === "saving"
                  ? "Saving report"
                  : submitState === "saved"
                    ? "Last report saved"
                    : submitState === "error"
                      ? "Save needs attention"
                      : "Ready for reports"}
              </div>
            </div>

            <form className="formPanel" onSubmit={submitIncident}>
              <div className="formGrid">
                <label>
                  Date
                  <input
                    required
                    type="date"
                    value={form.date}
                    onChange={(event) =>
                      setForm({ ...form, date: event.target.value })
                    }
                  />
                </label>
                <label>
                  Time
                  <input
                    required
                    type="time"
                    value={form.time}
                    onChange={(event) =>
                      setForm({ ...form, time: event.target.value })
                    }
                  />
                </label>
              </div>

              <label>
                Location
                <input
                  required
                  placeholder="Station approach, crossing, street or postcode"
                  value={form.location}
                  onChange={(event) =>
                    setForm({ ...form, location: event.target.value })
                  }
                />
              </label>

              <div className="formGrid">
                <label>
                  Incident category
                  <select
                    value={form.category}
                    onChange={(event) =>
                      setForm({ ...form, category: event.target.value })
                    }
                  >
                    {categories.map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Impact
                  <input
                    required
                    placeholder="Sleep disruption, traffic delay, business impact"
                    value={form.impact}
                    onChange={(event) =>
                      setForm({ ...form, impact: event.target.value })
                    }
                  />
                </label>
              </div>

              <label>
                What happened?
                <textarea
                  required
                  rows={6}
                  placeholder="Keep it factual: what, when, where, who was affected and whether notice was given."
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                />
              </label>

              <div className="formGrid">
                <label>
                  Reporter name
                  <input
                    required
                    placeholder="Not shown publicly"
                    value={form.reporterName}
                    onChange={(event) =>
                      setForm({ ...form, reporterName: event.target.value })
                    }
                  />
                </label>
                <label>
                  Email
                  <input
                    required
                    type="email"
                    placeholder="For verification and follow-up"
                    value={form.reporterEmail}
                    onChange={(event) =>
                      setForm({ ...form, reporterEmail: event.target.value })
                    }
                  />
                </label>
              </div>

              <label>
                Postcode area
                <input
                  required
                  placeholder="e.g. IP17"
                  value={form.postcode}
                  onChange={(event) =>
                    setForm({ ...form, postcode: event.target.value })
                  }
                />
              </label>

              <fieldset>
                <legend>Consent choices</legend>
                <label className="checkRow">
                  <input
                    type="checkbox"
                    checked={form.consentNetworkRail}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        consentNetworkRail: event.target.checked,
                      })
                    }
                  />
                  Share this report with Network Rail after review
                </label>
                <label className="checkRow">
                  <input
                    type="checkbox"
                    checked={form.consentCouncil}
                    onChange={(event) =>
                      setForm({ ...form, consentCouncil: event.target.checked })
                    }
                  />
                  Include anonymised details in Town Council evidence packs
                </label>
                <label className="checkRow">
                  <input
                    type="checkbox"
                    checked={form.consentMp}
                    onChange={(event) =>
                      setForm({ ...form, consentMp: event.target.checked })
                    }
                  />
                  Share casework details with Jenny Riddell-Carpenter MP
                </label>
              </fieldset>

              <button
                className="button primary fullButton"
                disabled={submitState === "saving"}
                type="submit"
              >
                {submitState === "saving" ? "Saving..." : "Submit incident"}
              </button>
            </form>
          </section>

          <section className="section evidence" id="evidence">
            <div className="sectionHeading dashboardHead">
              <div>
                <p className="eyebrow">Public evidence</p>
                <h2>Pattern snapshot</h2>
              </div>
              <div className="dashboardActions">
                <button className="button secondary" onClick={exportCsv}>
                  Export CSV
                </button>
              </div>
            </div>
            <div className="metricGrid">
              <Metric label="Total incidents" value={stats.total} />
              <Metric label="Consent recorded" value={stats.consented} />
              <Metric label="Overnight noise" value={stats.overnight} />
              <Metric label="Ready to send" value={stats.ready} />
            </div>
            <div className="mapPanel">
              <div className="mapRail" aria-hidden="true" />
              <div>
                <p className="eyebrow">Saxmundham focus</p>
                <h3>Structured reports build a chronology, not a pile of emails.</h3>
                <p>
                  The public view stays aggregated. The private admin view can
                  load identifiable Supabase reports only after workspace
                  authentication succeeds.
                </p>
              </div>
            </div>
          </section>

          <section className="section dashboard" id="admin">
            <div className="sectionHeading dashboardHead">
              <div>
                <p className="eyebrow">Workspace admin</p>
                <h2>Review queue</h2>
              </div>
              <div className="dashboardActions">
                <button className="button secondary" onClick={loadAdminIncidents}>
                  {adminState === "loading" ? "Checking..." : "Load private reports"}
                </button>
              </div>
            </div>

            {adminState !== "ready" ? (
              <div className="lockedPanel">
                <strong>Admin dashboard is locked</strong>
                <p>
                  Incident reads call `GET /api/incidents`. The server checks
                  for workspace authentication headers before it queries
                  Supabase with the service role key.
                </p>
                {adminMessage ? <small>{adminMessage}</small> : null}
              </div>
            ) : (
              <>
                <div className="viewerBar">
                  Authenticated as <strong>{viewer}</strong>
                </div>
                <div className="adminGrid">
                  <div className="incidentList" aria-label="Incident list">
                    {incidents.map((incident) => (
                      <button
                        className={`incidentRow ${
                          incident.id === selected?.id ? "active" : ""
                        }`}
                        key={incident.id}
                        onClick={() => setSelectedId(incident.id)}
                      >
                        <span>
                          <strong>{incident.reference}</strong>
                          <small>{incident.category}</small>
                        </span>
                        <em>{incident.status}</em>
                      </button>
                    ))}
                  </div>

                  <article className="detailPanel">
                    {selected ? (
                      <>
                        <div className="detailTop">
                          <div>
                            <p className="eyebrow">{selected.reference}</p>
                            <h3>{selected.category}</h3>
                          </div>
                          <span className="statusPill ready">{selected.status}</span>
                        </div>

                        <dl className="facts">
                          <div>
                            <dt>Date</dt>
                            <dd>{selected.date}</dd>
                          </div>
                          <div>
                            <dt>Time</dt>
                            <dd>{selected.time}</dd>
                          </div>
                          <div>
                            <dt>Location</dt>
                            <dd>{selected.location}</dd>
                          </div>
                          <div>
                            <dt>Postcode</dt>
                            <dd>{selected.postcode}</dd>
                          </div>
                        </dl>

                        <div className="reporterPanel">
                          <span>Reporter</span>
                          <strong>{selected.reporterName}</strong>
                          <small>{selected.reporterEmail}</small>
                        </div>
                        <p className="description">{selected.description}</p>

                        <div className="draftBox">
                          <div className="draftHeader">
                            <h4>Complaint draft</h4>
                            <button
                              className="button ghost"
                              onClick={() => {
                                navigator.clipboard.writeText(complaintDraft);
                                showToast("Complaint draft copied");
                              }}
                            >
                              Copy
                            </button>
                          </div>
                          <pre>{complaintDraft}</pre>
                        </div>
                      </>
                    ) : (
                      <p>No incident selected.</p>
                    )}
                  </article>
                </div>
              </>
            )}
          </section>

          <section className="section privacy" id="privacy">
            <div className="sectionHeading">
              <p className="eyebrow">Launch controls</p>
              <h2>Security and data boundaries</h2>
            </div>
            <div className="guardrails">
              <article>
                <h3>Server-only Supabase key</h3>
                <p>
                  The frontend never receives the service role key. Browser code
                  only calls same-origin API routes.
                </p>
              </article>
              <article>
                <h3>Authenticated admin reads</h3>
                <p>
                  Private report loading requires workspace identity headers and
                  can be narrowed with `ADMIN_EMAILS`.
                </p>
              </article>
              <article>
                <h3>Consent-aware casework</h3>
                <p>
                  Complaint drafts include the recorded consent flags so admins
                  can avoid oversharing personal details.
                </p>
              </article>
            </div>
          </section>
        </section>
      </section>

      <footer>
        <strong>Saxmundham Rail Watch</strong>
        <span>Supabase-ready incident evidence platform.</span>
      </footer>

      {toast ? <div className="toast">{toast}</div> : null}
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <article className="metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
  );
}
