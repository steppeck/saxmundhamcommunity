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
  reporter: string;
  postcode: string;
  consentNetworkRail: boolean;
  consentCouncil: boolean;
  consentMp: boolean;
  status: IncidentStatus;
};

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
    reporter: "Resident A",
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
    reporter: "Resident B",
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
    reporter: "Business owner",
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
  reporter: "",
  postcode: "",
  consentNetworkRail: true,
  consentCouncil: true,
  consentMp: true,
};

export default function Home() {
  const [incidents, setIncidents] = useState<Incident[]>(seedIncidents);
  const [form, setForm] = useState(blankIncident);
  const [selectedId, setSelectedId] = useState(seedIncidents[0].id);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const stored = window.localStorage.getItem("sax-rail-watch-incidents");
    if (stored) {
      setIncidents(JSON.parse(stored));
      const parsed = JSON.parse(stored) as Incident[];
      if (parsed[0]) setSelectedId(parsed[0].id);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      "sax-rail-watch-incidents",
      JSON.stringify(incidents),
    );
  }, [incidents]);

  const selected = incidents.find((incident) => incident.id === selectedId);

  const stats = useMemo(() => {
    const overnight = incidents.filter((i) => i.category === "Overnight noise");
    const ready = incidents.filter((i) => i.status === "Ready to send");
    const consented = incidents.filter(
      (i) => i.consentCouncil || i.consentMp || i.consentNetworkRail,
    );

    return {
      total: incidents.length,
      overnight: overnight.length,
      ready: ready.length,
      consented: consented.length,
    };
  }, [incidents]);

  function submitIncident(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextNumber = String(incidents.length + 1).padStart(3, "0");
    const incident: Incident = {
      id: crypto.randomUUID(),
      reference: `SAX-2026-${nextNumber}`,
      ...form,
      status: "Pending",
    };

    setIncidents((current) => [incident, ...current]);
    setSelectedId(incident.id);
    setForm(blankIncident);
    showToast(`${incident.reference} added to the evidence log`);
  }

  function updateStatus(id: string, status: IncidentStatus) {
    setIncidents((current) =>
      current.map((incident) =>
        incident.id === id ? { ...incident, status } : incident,
      ),
    );
  }

  function resetDemo() {
    setIncidents(seedIncidents);
    setSelectedId(seedIncidents[0].id);
    showToast("Demo data restored");
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
      ],
      ...incidents.map((incident) => [
        incident.reference,
        incident.date,
        incident.time,
        incident.location,
        incident.category,
        incident.impact,
        incident.status,
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
    window.setTimeout(() => setToast(""), 2600);
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

This scratch MVP does not send live emails. In the production build, an authorised administrator would review the report, confirm consent, and send or export it through the agreed route.`
    : "";

  return (
    <main>
      <section className="hero">
        <nav className="topbar" aria-label="Primary navigation">
          <a className="brand" href="#top" aria-label="Saxmundham Rail Watch">
            <span className="brandMark">SR</span>
            <span>Saxmundham Rail Watch</span>
          </a>
          <div className="navLinks">
            <a href="#report">Report</a>
            <a href="#dashboard">Dashboard</a>
            <a href="#privacy">Privacy</a>
          </div>
        </nav>

        <div className="heroGrid" id="top">
          <div className="heroCopy">
            <p className="eyebrow">Scratch MVP</p>
            <h1>Turn rail disruption into structured evidence.</h1>
            <p>
              A resident-facing incident log for Saxmundham: collect consistent
              reports, protect personal details, and prepare reviewed complaint
              packs for Network Rail, the Town Council and the local MP.
            </p>
            <div className="heroActions">
              <a className="button primary" href="#report">
                Log an incident
              </a>
              <a className="button secondary" href="#dashboard">
                Review evidence
              </a>
            </div>
          </div>

          <div className="signalPanel" aria-label="Current evidence summary">
            <div>
              <span className="panelLabel">Live demo reference</span>
              <strong>{selected?.reference ?? "SAX-2026-000"}</strong>
            </div>
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
                <strong>{stats.overnight}</strong>
                overnight
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="section overview" aria-label="Platform workflow">
        <div className="sectionHeading">
          <p className="eyebrow">How the pilot works</p>
          <h2>Evidence first, automation second.</h2>
        </div>
        <div className="workflow">
          {[
            ["1", "Resident logs incident", "Consistent fields, consent choices and a generated reference."],
            ["2", "Admin reviews", "Moderation keeps unreliable, duplicate or unsafe material out of complaint packs."],
            ["3", "Complaint draft", "A structured draft is created for the agreed reporting route."],
            ["4", "Digest evidence", "Patterns can be exported for councillors, the MP and campaign records."],
          ].map(([step, title, text]) => (
            <article className="workflowItem" key={step}>
              <span>{step}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section split" id="report">
        <div className="sectionHeading stickyHeading">
          <p className="eyebrow">Public form</p>
          <h2>Log a new incident</h2>
          <p>
            This version stores demo reports in your browser only. It is for
            testing wording, flow and evidence structure before adding a secure
            backend.
          </p>
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

          <label>
            What happened?
            <textarea
              required
              rows={5}
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
                value={form.reporter}
                onChange={(event) =>
                  setForm({ ...form, reporter: event.target.value })
                }
              />
            </label>
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
          </div>

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

          <button className="button primary fullButton" type="submit">
            Add incident to demo log
          </button>
        </form>
      </section>

      <section className="section dashboard" id="dashboard">
        <div className="sectionHeading dashboardHead">
          <div>
            <p className="eyebrow">Admin view</p>
            <h2>Evidence dashboard</h2>
          </div>
          <div className="dashboardActions">
            <button className="button secondary" onClick={exportCsv}>
              Export CSV
            </button>
            <button className="button ghost" onClick={resetDemo}>
              Reset demo
            </button>
          </div>
        </div>

        <div className="metricGrid">
          <Metric label="Total incidents" value={stats.total} />
          <Metric label="Ready to send" value={stats.ready} />
          <Metric label="Consent recorded" value={stats.consented} />
          <Metric label="Overnight noise" value={stats.overnight} />
        </div>

        <div className="adminGrid">
          <div className="incidentList" aria-label="Incident list">
            {incidents.map((incident) => (
              <button
                className={`incidentRow ${
                  incident.id === selectedId ? "active" : ""
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
                  <select
                    value={selected.status}
                    onChange={(event) =>
                      updateStatus(
                        selected.id,
                        event.target.value as IncidentStatus,
                      )
                    }
                  >
                    <option>Pending</option>
                    <option>Reviewed</option>
                    <option>Ready to send</option>
                  </select>
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
                    <dt>Impact</dt>
                    <dd>{selected.impact}</dd>
                  </div>
                </dl>

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
      </section>

      <section className="section privacy" id="privacy">
        <div className="sectionHeading">
          <p className="eyebrow">Launch guardrails</p>
          <h2>Not a spam machine. An evidence system.</h2>
        </div>
        <div className="guardrails">
          <article>
            <h3>Consent separated</h3>
            <p>
              Identifiable details should be shared only with explicit consent,
              and the public dashboard should stay aggregated and anonymised.
            </p>
          </article>
          <article>
            <h3>Human review</h3>
            <p>
              A moderator checks duplicates, unsafe uploads and defamatory
              wording before any complaint leaves the system.
            </p>
          </article>
          <article>
            <h3>Backend later</h3>
            <p>
              The live build would add Supabase, authentication, evidence
              storage, email verification, audit logs and retention controls.
            </p>
          </article>
        </div>
      </section>

      <footer>
        <strong>Saxmundham Rail Watch</strong>
        <span>Scratch MVP for structured incident evidence.</span>
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
