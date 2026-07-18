import { createHmac } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { siteConfig } from "@/config/site";
import { publicSupabase } from "@/lib/supabase";
import { friendlyErrors, reportSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 32_000)
    return NextResponse.json(
      { error: "The report is too large." },
      { status: 413 },
    );

  let body: unknown;
  try {
    const raw = await request.text();
    if (raw.length > 32_000)
      return NextResponse.json(
        { error: "The report is too large." },
        { status: 413 },
      );
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json(
      { error: "The report could not be read." },
      { status: 400 },
    );
  }

  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Check the marked answers.",
        errors: friendlyErrors(parsed.error),
      },
      { status: 400 },
    );
  }
  if (parsed.data.website)
    return NextResponse.json(
      { error: "The report could not be accepted." },
      { status: 400 },
    );

  const secret = process.env.SUBMISSION_SECRET;
  if (!secret || secret.length < 32) {
    return NextResponse.json(
      {
        error:
          "Reporting is temporarily unavailable while the service is configured.",
      },
      { status: 503 },
    );
  }

  const fingerprint = createHmac("sha256", secret)
    .update(parsed.data.submissionToken)
    .digest("hex");
  const payload = {
    ...parsed.data,
    fingerprint,
    retentionDays: siteConfig.contactRetentionDays,
  };
  delete (payload as Partial<typeof payload>).website;
  delete (payload as Partial<typeof payload>).submissionToken;
  delete (payload as Partial<typeof payload>).accuracyConfirmed;

  const { data, error } = await publicSupabase().rpc("submit_incident", {
    payload,
  });
  if (error) {
    const duplicate = error.message
      .toLowerCase()
      .includes("already been submitted");
    return NextResponse.json(
      {
        error: duplicate
          ? "This report has already been submitted."
          : "We could not save the report. Please try again.",
      },
      { status: duplicate ? 409 : 502 },
    );
  }
  return NextResponse.json({ reference: data }, { status: 201 });
}
