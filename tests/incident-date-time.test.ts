import { describe, expect, it } from "vitest";
import {
  currentUkDateAndTime,
  futureIncidentError,
} from "../lib/incident-date-time";

describe("incident date and time", () => {
  const now = new Date("2026-07-19T14:30:00Z");

  it("uses the Saxmundham local date and time", () =>
    expect(currentUkDateAndTime(now)).toEqual({
      date: "2026-07-19",
      time: "15:30",
    }));

  it("accepts an earlier time today", () =>
    expect(futureIncidentError("2026-07-19", "15:29", now)).toBe(""));

  it("rejects a later time today", () =>
    expect(futureIncidentError("2026-07-19", "15:31", now)).toBe(
      "The time cannot be in the future.",
    ));

  it("rejects a later date", () =>
    expect(futureIncidentError("2026-07-20", "01:00", now)).toBe(
      "The date cannot be in the future.",
    ));
});
