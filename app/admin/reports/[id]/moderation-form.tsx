"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminReport } from "@/lib/types";
import { moderationStatuses } from "@/lib/options";
export function ModerationForm({ report }: { report: AdminReport }) {
  const router = useRouter();
  const [status, setStatus] = useState(report.status);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState(report.adminNote || "");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  async function save() {
    if (!confirm(`Change this report to ${status}?`)) return;
    setSaving(true);
    const response = await fetch(`/api/admin/reports/${report.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status, reason, adminNote: note }),
    });
    const result = await response.json();
    setMessage(response.ok ? "The report has been updated." : result.error);
    setSaving(false);
    if (response.ok) router.refresh();
  }
  async function anonymise() {
    if (
      !confirm("Delete the reporter's name and email? This cannot be undone.")
    )
      return;
    const response = await fetch(`/api/admin/reports/${report.id}`, {
      method: "DELETE",
    });
    setMessage(
      response.ok
        ? "Personal details deleted."
        : "Personal details could not be deleted.",
    );
    if (response.ok) router.refresh();
  }
  return (
    <aside>
      <h2>Moderation</h2>
      <p>
        Current status: <strong className="status">{report.status}</strong>
      </p>
      <div className="field">
        <label htmlFor="status">Decision</label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {moderationStatuses.map((item) => (
            <option key={item} value={item}>
              {item === "approved"
                ? "Approve for public statistics"
                : item[0].toUpperCase() + item.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="reason">
          Internal reason{" "}
          {status === "excluded" || status === "removed"
            ? "(required)"
            : "(optional)"}
        </label>
        <textarea
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="note">Private administrator note</label>
        <textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
      <button className="button primary" disabled={saving} onClick={save}>
        {saving ? "Saving..." : "Save decision"}
      </button>
      <hr />
      <h3>Personal information</h3>
      <button className="button danger" onClick={anonymise}>
        Delete name and email
      </button>
      <p aria-live="polite">{message}</p>
    </aside>
  );
}
