import { publicSupabase } from "./supabase";

export type PublicSubmissionSummary = {
  total: number;
  lastThirtyDays: number;
  thisMonth: number;
  sleepReports: number;
  areasRepresented: number;
  latestMonth: string | null;
  byMonth: Record<string, number>;
  byNoiseType: Record<string, number>;
  byBroadArea: Record<string, number>;
};

const emptySummary: PublicSubmissionSummary = {
  total: 0,
  lastThirtyDays: 0,
  thisMonth: 0,
  sleepReports: 0,
  areasRepresented: 0,
  latestMonth: null,
  byMonth: {},
  byNoiseType: {},
  byBroadArea: {},
};

export async function getPublicSubmissionSummary() {
  try {
    const { data, error } = await publicSupabase().rpc(
      "public_submission_summary",
    );
    if (error) throw error;
    const summary = data as Partial<PublicSubmissionSummary> | null;
    if (!summary) return emptySummary;
    return {
      ...emptySummary,
      ...summary,
      byMonth: summary.byMonth || {},
      byNoiseType: summary.byNoiseType || {},
      byBroadArea: summary.byBroadArea || {},
    };
  } catch {
    return emptySummary;
  }
}
