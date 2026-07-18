import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migrationDir = join(process.cwd(), "supabase", "migrations");
const sql = readdirSync(migrationDir)
  .map((file) => readFileSync(join(migrationDir, file), "utf8"))
  .join("\n");

describe("database privacy controls", () => {
  it("uses a private schema for personal data", () => {
    expect(sql).toContain("create schema if not exists private");
    expect(sql).toContain("private.reporter_details");
    expect(sql).toContain("private.report_comments");
  });
  it("revokes private schema access from public roles", () => {
    expect(sql).toContain(
      "revoke all on schema private from public, anon, authenticated",
    );
  });
  it("publishes approved reports only", () => {
    expect(sql).toContain("where i.status = 'approved'");
    expect(sql).toContain(
      "grant select on public.approved_reports to anon, authenticated",
    );
  });
  it("does not expose private fields in the public view", () => {
    const view = sql.slice(
      sql.indexOf("create or replace view public.approved_reports"),
      sql.indexOf("alter table public.broad_locations"),
    );
    for (const field of [
      "reporter_details",
      "report_comments",
      "admin_notes",
      "audit_log",
      "submitted_at",
      "incident_id",
    ])
      expect(view).not.toContain(field);
  });
});
