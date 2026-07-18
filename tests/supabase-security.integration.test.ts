import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const configured = Boolean(url && anon);

describe.skipIf(!configured)("live anonymous Supabase policies", () => {
  it("cannot read base, private, admin or audit data", async () => {
    const client = createClient(url!, anon!, {
      auth: { persistSession: false },
    });
    for (const table of [
      "incidents",
      "reporter_details",
      "report_comments",
      "admin_notes",
      "audit_log",
    ]) {
      const { data, error } = await client.from(table).select("*").limit(1);
      expect(
        error || !data?.length,
        `${table} unexpectedly returned rows`,
      ).toBeTruthy();
    }
  });
  it("public view has an exact non-personal field allowlist", async () => {
    const client = createClient(url!, anon!, {
      auth: { persistSession: false },
    });
    const { data, error } = await client
      .from("approved_reports")
      .select("*")
      .limit(1);
    expect(error).toBeNull();
    if (data?.[0])
      expect(Object.keys(data[0]).sort()).toEqual(
        [
          "approximate_time",
          "broad_area",
          "disruption_level",
          "duration",
          "effects",
          "experienced_at",
          "frequency",
          "incident_date",
          "noise_type",
          "reference",
          "report_timing",
          "time_period",
          "window_state",
        ].sort(),
      );
  });
});
