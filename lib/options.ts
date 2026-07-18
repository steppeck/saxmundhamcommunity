export const noiseTypes = [
  "Train horn",
  "Engine noise or idling",
  "Wheel or rail squeal",
  "Track or engineering work",
  "Crossing or barrier alarm",
  "Vibration",
  "Repeated passing trains",
  "Other or unsure",
] as const;

export const durations = [
  "Under 1 minute",
  "1-5 minutes",
  "6-15 minutes",
  "16-30 minutes",
  "31-60 minutes",
  "Over 1 hour",
  "Repeated intermittently",
  "Unsure",
] as const;

export const experiencedAt = ["Indoors", "Outdoors", "Both"] as const;
export const windowStates = [
  "Windows closed",
  "Windows open",
  "Unsure or not applicable",
] as const;
export const effects = [
  "Woke me or prevented sleep",
  "Disturbed a child's sleep",
  "Interrupted conversation",
  "Interrupted work or concentration",
  "Interrupted television, music or normal household activity",
  "Caused vibration inside a building",
  "Caused distress, fear or significant annoyance",
  "No substantial effect",
  "Other",
] as const;
export const disruptionLevels = [
  "Not very disruptive",
  "Slightly disruptive",
  "Moderately disruptive",
  "Very disruptive",
  "Extremely disruptive",
] as const;
export const frequencies = [
  "This was the first time",
  "Less than weekly",
  "One or two days a week",
  "Three or four days a week",
  "Most days",
  "Several times a day",
  "Unsure",
] as const;
export const reportTimings = [
  "While it is happening",
  "Later the same day",
  "One or more days later",
] as const;
export const moderationStatuses = [
  "pending",
  "approved",
  "duplicate",
  "excluded",
  "removed",
] as const;
