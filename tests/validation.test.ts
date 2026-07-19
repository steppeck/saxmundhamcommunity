import { describe, expect, it } from "vitest";
import { reportSchema } from "../lib/validation";

const valid = {
  incidentDate: "2026-07-01",
  approximateTime: "01:30",
  broadArea: "Town centre and station",
  streetName: "Station Approach",
  noiseType: ["Train horn"],
  duration: "1-5 minutes",
  experiencedAt: "Indoors",
  windowState: "Windows closed",
  effects: ["Woke me or prevented sleep"],
  disruptionLevel: "Very disruptive",
  frequency: "One or two days a week",
  reportTiming: "Later the same day",
  privateComments: "",
  reporterName: "",
  reporterEmail: "",
  accuracyConfirmed: true,
  updatesOptIn: false,
  website: "",
  submissionToken: "1234567890abcdef",
} as const;

describe("report validation", () => {
  it("accepts a minimal valid report", () =>
    expect(reportSchema.safeParse(valid).success).toBe(true));
  it("rejects a future incident date", () =>
    expect(
      reportSchema.safeParse({ ...valid, incidentDate: "2999-01-01" }).success,
    ).toBe(false));
  it("rejects unknown choices", () =>
    expect(
      reportSchema.safeParse({ ...valid, noiseType: ["Anything"] }).success,
    ).toBe(false));
  it("accepts more than one disturbance type", () =>
    expect(
      reportSchema.safeParse({
        ...valid,
        noiseType: ["Train horn", "Engine noise or idling"],
      }).success,
    ).toBe(true));
  it("allows optional contact details", () =>
    expect(
      reportSchema.safeParse({ ...valid, reporterName: "", reporterEmail: "" })
        .success,
    ).toBe(true));
  it("requires the accuracy confirmation", () =>
    expect(
      reportSchema.safeParse({ ...valid, accuracyConfirmed: false }).success,
    ).toBe(false));
  it("requires an email address when updates are selected", () =>
    expect(
      reportSchema.safeParse({
        ...valid,
        updatesOptIn: true,
        reporterEmail: "",
      }).success,
    ).toBe(false));
});
