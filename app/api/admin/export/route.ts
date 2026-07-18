import { getAdminSession } from "@/lib/admin-session";
import { getAdminReports } from "@/lib/admin-reports";

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) return new Response("Sign in is required.", { status: 401 });
  const privateExport =
    new URL(request.url).searchParams.get("scope") === "private";
  const reports = await getAdminReports(session.token);
  const columns = privateExport
    ? [
        "reference",
        "incidentDate",
        "approximateTime",
        "broadArea",
        "streetName",
        "noiseType",
        "duration",
        "experiencedAt",
        "windowState",
        "effects",
        "disruptionLevel",
        "frequency",
        "reportTiming",
        "status",
        "reporterName",
        "reporterEmail",
        "privateComments",
        "adminNote",
      ]
    : [
        "reference",
        "incidentDate",
        "approximateTime",
        "broadArea",
        "streetName",
        "noiseType",
        "duration",
        "experiencedAt",
        "windowState",
        "effects",
        "disruptionLevel",
        "frequency",
        "reportTiming",
        "status",
      ];
  const rows = [
    columns,
    ...reports
      .filter((r) => privateExport || r.status === "approved")
      .map((report) =>
        columns.map((key) => {
          const value = report[key as keyof typeof report];
          return Array.isArray(value) ? value.join("; ") : (value ?? "");
        }),
      ),
  ];
  const csv = rows
    .map((row) =>
      row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","),
    )
    .join("\n");
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${privateExport ? "protected-admin-report-data" : "approved-public-report-data"}.csv"`,
      "cache-control": "no-store",
    },
  });
}
