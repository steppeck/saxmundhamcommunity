import { z } from "zod";
import {
  disruptionLevels,
  durations,
  effects,
  experiencedAt,
  frequencies,
  noiseTypes,
  reportTimings,
  windowStates,
} from "./options";
import { futureIncidentError } from "./incident-date-time";

const optionalText = (maximum: number) =>
  z.string().trim().max(maximum).optional().or(z.literal(""));

export const reportSchema = z
  .object({
    incidentDate: z.string().date(),
    approximateTime: z.string().regex(/^\d{2}:\d{2}$/),
    broadArea: z.string().trim().min(1).max(80),
    streetName: optionalText(100),
    noiseType: z.array(z.enum(noiseTypes)).min(1).max(noiseTypes.length),
    duration: z.enum(durations),
    experiencedAt: z.enum(experiencedAt),
    windowState: z.enum(windowStates).optional().or(z.literal("")),
    effects: z.array(z.enum(effects)).min(1),
    disruptionLevel: z.enum(disruptionLevels),
    frequency: z.enum(frequencies),
    reportTiming: z.enum(reportTimings),
    privateComments: optionalText(2000),
    reporterName: optionalText(100),
    reporterEmail: z
      .string()
      .trim()
      .email()
      .max(254)
      .optional()
      .or(z.literal("")),
    accuracyConfirmed: z.literal(true),
    updatesOptIn: z.boolean().default(false),
    website: z.string().max(0).optional(),
    submissionToken: z.string().min(16).max(100),
  })
  .refine(
    (value) => value.experiencedAt === "Outdoors" || Boolean(value.windowState),
    { message: "Choose the window position.", path: ["windowState"] },
  )
  .superRefine((value, context) => {
    const futureError = futureIncidentError(
      value.incidentDate,
      value.approximateTime,
    );
    if (futureError)
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: futureError,
        path: [
          futureError.includes("time") ? "approximateTime" : "incidentDate",
        ],
      });
    if (value.updatesOptIn && !value.reporterEmail)
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter an email address to receive updates.",
        path: ["reporterEmail"],
      });
  });

export type ReportInput = z.infer<typeof reportSchema>;

export function friendlyErrors(error: z.ZodError) {
  return error.issues.reduce<Record<string, string>>((result, issue) => {
    const field = String(issue.path[0] || "form");
    if (!result[field]) result[field] = issue.message;
    return result;
  }, {});
}
