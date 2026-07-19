const ukDateTime = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/London",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function currentUkDateAndTime(now = new Date()) {
  const parts = Object.fromEntries(
    ukDateTime
      .formatToParts(now)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`,
  };
}

export function futureIncidentError(
  incidentDate: string,
  approximateTime: string,
  now = new Date(),
) {
  const current = currentUkDateAndTime(now);
  if (incidentDate > current.date) return "The date cannot be in the future.";
  if (incidentDate === current.date && approximateTime > current.time)
    return "The time cannot be in the future.";
  return "";
}
