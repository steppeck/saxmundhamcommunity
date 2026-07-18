import { publicSupabase } from "./supabase";
import type { PublicReport } from "./types";

type PublicRow = {
  reference: string;
  incident_date: string;
  approximate_time: string;
  time_period: string;
  broad_area: string;
  street_name: string | null;
  noise_type: string;
  duration: string;
  experienced_at: string;
  window_state: string | null;
  effects: string[];
  disruption_level: string;
  frequency: string;
  report_timing: string;
};

export async function getPublicReports(): Promise<PublicReport[]> {
  try {
    const { data, error } = await publicSupabase()
      .from("approved_reports")
      .select("*")
      .order("incident_date", { ascending: false })
      .limit(1000);
    if (error) throw error;
    return ((data || []) as PublicRow[]).map((row) => ({
      reference: row.reference,
      incidentDate: row.incident_date,
      approximateTime: row.approximate_time,
      timePeriod: row.time_period,
      broadArea: row.broad_area,
      streetName: row.street_name,
      noiseType: row.noise_type,
      duration: row.duration,
      experiencedAt: row.experienced_at,
      windowState: row.window_state,
      effects: row.effects,
      disruptionLevel: row.disruption_level,
      frequency: row.frequency,
      reportTiming: row.report_timing,
    }));
  } catch {
    return [];
  }
}
