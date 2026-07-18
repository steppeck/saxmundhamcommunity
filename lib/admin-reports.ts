import type { AdminReport } from "./types";
import { userSupabase } from "./supabase";

type Raw = Record<string, unknown>;
export async function getAdminReports(
  token: string,
  id?: string,
): Promise<AdminReport[]> {
  const { data, error } = await userSupabase(token).rpc("admin_reports", {
    report_id: id || null,
  });
  if (error) throw new Error(error.message);
  return ((data || []) as Raw[]).map((r) => ({
    id: String(r.id),
    reference: String(r.reference),
    incidentDate: String(r.incident_date),
    approximateTime: String(r.approximate_time),
    timePeriod: "",
    broadArea: String(r.broad_area),
    noiseType: String(r.noise_type),
    duration: String(r.duration),
    experiencedAt: String(r.experienced_at),
    windowState: r.window_state ? String(r.window_state) : null,
    effects: (r.effects || []) as string[],
    disruptionLevel: String(r.disruption_level),
    frequency: String(r.frequency),
    reportTiming: String(r.report_timing),
    status: String(r.status),
    reporterName: r.reporter_name ? String(r.reporter_name) : null,
    reporterEmail: r.reporter_email ? String(r.reporter_email) : null,
    privateComments: r.private_comments ? String(r.private_comments) : null,
    adminNote: r.admin_note ? String(r.admin_note) : null,
    submittedAt: String(r.submitted_at),
    history: Array.isArray(r.history)
      ? (r.history as Array<Record<string, unknown>>).map((item) => ({
          action: String(item.action),
          fromStatus: item.fromStatus ? String(item.fromStatus) : null,
          toStatus: item.toStatus ? String(item.toStatus) : null,
          reason: item.reason ? String(item.reason) : null,
          createdAt: String(item.createdAt),
        }))
      : [],
  }));
}
