import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { moderationStatuses } from "@/lib/options";
import { userSupabase } from "@/lib/supabase";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json(
      { error: "Sign in is required." },
      { status: 401 },
    );
  const { id } = await context.params;
  const body = await request.json();
  if (!moderationStatuses.includes(body.status))
    return NextResponse.json(
      { error: "Choose a valid status." },
      { status: 400 },
    );
  if (
    (body.status === "excluded" || body.status === "removed") &&
    !String(body.reason || "").trim()
  )
    return NextResponse.json(
      { error: "Enter an internal reason." },
      { status: 400 },
    );
  const { error } = await userSupabase(session.token).rpc("moderate_report", {
    report_id: id,
    new_status: body.status,
    reason: String(body.reason || "").slice(0, 1000) || null,
    corrected_fields: {},
    admin_note: String(body.adminNote || "").slice(0, 2000) || null,
  });
  if (error)
    return NextResponse.json(
      { error: "The report could not be updated." },
      { status: 502 },
    );
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json(
      { error: "Sign in is required." },
      { status: 401 },
    );
  const { id } = await context.params;
  const { error } = await userSupabase(session.token).rpc(
    "anonymise_reporter",
    { report_id: id },
  );
  if (error)
    return NextResponse.json(
      { error: "Personal details could not be deleted." },
      { status: 502 },
    );
  return NextResponse.json({ ok: true });
}
