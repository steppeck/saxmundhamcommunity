"use client";

import { useMemo, useState } from "react";
import type { PublicReport } from "@/lib/types";

const pageSize = 10;
export function ReportsRegister({ reports }: { reports: PublicReport[] }) {
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    area: "",
    type: "",
    duration: "",
    effect: "",
    disruption: "",
    frequency: "",
    timePeriod: "",
  });
  const [page, setPage] = useState(1);
  const choices = (key: keyof PublicReport) =>
    [
      ...new Set(
        reports.flatMap((r) => {
          const value = r[key];
          return Array.isArray(value) ? value : value ? [String(value)] : [];
        }),
      ),
    ].sort();
  const filtered = useMemo(
    () =>
      reports.filter(
        (r) =>
          (!filters.from || r.incidentDate >= filters.from) &&
          (!filters.to || r.incidentDate <= filters.to) &&
          (!filters.area || r.broadArea === filters.area) &&
          (!filters.type || r.noiseType === filters.type) &&
          (!filters.duration || r.duration === filters.duration) &&
          (!filters.effect || r.effects.includes(filters.effect)) &&
          (!filters.disruption || r.disruptionLevel === filters.disruption) &&
          (!filters.frequency || r.frequency === filters.frequency) &&
          (!filters.timePeriod || r.timePeriod === filters.timePeriod),
      ),
    [reports, filters],
  );
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const shown = filtered.slice((page - 1) * pageSize, page * pageSize);
  function set(key: keyof typeof filters, value: string) {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  }
  function reset() {
    setFilters({
      from: "",
      to: "",
      area: "",
      type: "",
      duration: "",
      effect: "",
      disruption: "",
      frequency: "",
      timePeriod: "",
    });
    setPage(1);
  }
  function csv() {
    const columns: Array<keyof PublicReport> = [
      "reference",
      "incidentDate",
      "approximateTime",
      "timePeriod",
      "broadArea",
      "noiseType",
      "duration",
      "experiencedAt",
      "windowState",
      "effects",
      "disruptionLevel",
      "frequency",
      "reportTiming",
    ];
    const rows = [
      columns,
      ...filtered.map((r) =>
        columns.map((c) =>
          Array.isArray(r[c]) ? (r[c] as string[]).join("; ") : (r[c] ?? ""),
        ),
      ),
    ];
    const content = rows
      .map((row) =>
        row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","),
      )
      .join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([content], { type: "text/csv" }));
    link.download = "saxmundham-approved-rail-reports.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  }
  return (
    <>
      <section className="filters" aria-labelledby="filter-heading">
        <h2 id="filter-heading">Filter reports</h2>
        <div className="filter-grid">
          <Filter
            label="From date"
            type="date"
            value={filters.from}
            onChange={(v) => set("from", v)}
          />
          <Filter
            label="To date"
            type="date"
            value={filters.to}
            onChange={(v) => set("to", v)}
          />
          <Select
            label="Time period"
            value={filters.timePeriod}
            options={choices("timePeriod")}
            onChange={(v) => set("timePeriod", v)}
          />
          <Select
            label="Broad area"
            value={filters.area}
            options={choices("broadArea")}
            onChange={(v) => set("area", v)}
          />
          <Select
            label="Noise type"
            value={filters.type}
            options={choices("noiseType")}
            onChange={(v) => set("type", v)}
          />
          <Select
            label="Duration"
            value={filters.duration}
            options={choices("duration")}
            onChange={(v) => set("duration", v)}
          />
          <Select
            label="Effect"
            value={filters.effect}
            options={choices("effects")}
            onChange={(v) => set("effect", v)}
          />
          <Select
            label="Disruption"
            value={filters.disruption}
            options={choices("disruptionLevel")}
            onChange={(v) => set("disruption", v)}
          />
          <Select
            label="Frequency"
            value={filters.frequency}
            options={choices("frequency")}
            onChange={(v) => set("frequency", v)}
          />
        </div>
        <div className="actions filter-actions">
          <button className="button secondary" type="button" onClick={reset}>
            Reset filters
          </button>
          <button className="button secondary" type="button" onClick={csv}>
            Download public CSV
          </button>
        </div>
      </section>
      <p role="status">
        <strong>{filtered.length}</strong> matching{" "}
        {filtered.length === 1 ? "report" : "reports"}
      </p>
      <div className="report-cards">
        {shown.map((report) => (
          <article className="report-card" key={report.reference}>
            <h2>{report.reference}</h2>
            <dl>
              <Fact term="Incident date" value={report.incidentDate} />
              <Fact term="Approximate time" value={report.approximateTime} />
              <Fact term="Broad area" value={report.broadArea} />
              <Fact term="Noise type" value={report.noiseType} />
              <Fact term="Duration" value={report.duration} />
              <Fact term="Experienced" value={report.experiencedAt} />
              <Fact
                term="Window position"
                value={report.windowState || "Not applicable"}
              />
              <Fact term="Overall disruption" value={report.disruptionLevel} />
              <Fact term="Frequency" value={report.frequency} />
              <Fact term="Reported" value={report.reportTiming} />
              <Fact term="Effects" value={report.effects.join("; ")} />
            </dl>
          </article>
        ))}
        {!shown.length && <p>No approved reports match these filters.</p>}
      </div>
      {filtered.length > pageSize && (
        <nav className="pagination" aria-label="Report pages">
          <button
            className="button secondary"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous page
          </button>
          <span>
            Page {page} of {pages}
          </span>
          <button
            className="button secondary"
            disabled={page === pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next page
          </button>
        </nav>
      )}
    </>
  );
}
function Filter({
  label,
  type,
  value,
  onChange,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label>
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label>
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">All</option>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}
function Fact({ term, value }: { term: string; value: string }) {
  return (
    <div>
      <dt>{term}</dt>
      <dd>{value}</dd>
    </div>
  );
}
