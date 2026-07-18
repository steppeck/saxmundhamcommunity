const corsHeaders = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

const incidentFields = [
  "id",
  "reference",
  "incident_date",
  "incident_time",
  "location",
  "category",
  "impact",
  "description",
  "reporter_name",
  "reporter_email",
  "postcode",
  "consent_network_rail",
  "consent_council",
  "consent_mp",
  "status",
  "created_at",
];

function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { ...corsHeaders, ...(init.headers || {}) },
  });
}

function missingConfig(env) {
  return ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"].filter((key) => !env?.[key]);
}

function tableName(env) {
  return env.SUPABASE_INCIDENTS_TABLE || "incidents";
}

function supabaseBase(env) {
  return `${env.SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${encodeURIComponent(tableName(env))}`;
}

function bearerHeaders(env, extra = {}) {
  return {
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    ...extra,
  };
}

function normaliseText(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

function makeReference(dateValue) {
  const year = /^\d{4}/.test(dateValue) ? dateValue.slice(0, 4) : new Date().getUTCFullYear();
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  const bytes = new Uint8Array(5);
  crypto.getRandomValues(bytes);
  for (const byte of bytes) suffix += alphabet[byte % alphabet.length];
  return `SAX-${year}-${suffix}`;
}

async function parseIncident(request) {
  const body = await request.json();
  const payload = {
    reference: makeReference(body.date),
    incident_date: normaliseText(body.date, 10),
    incident_time: normaliseText(body.time, 5),
    location: normaliseText(body.location, 180),
    category: normaliseText(body.category, 80),
    impact: normaliseText(body.impact, 240),
    description: normaliseText(body.description, 3000),
    reporter_name: normaliseText(body.reporterName, 140),
    reporter_email: normaliseText(body.reporterEmail, 240).toLowerCase(),
    postcode: normaliseText(body.postcode, 20).toUpperCase(),
    consent_network_rail: Boolean(body.consentNetworkRail),
    consent_council: Boolean(body.consentCouncil),
    consent_mp: Boolean(body.consentMp),
    status: "Pending",
  };

  const required = [
    "incident_date",
    "incident_time",
    "location",
    "category",
    "impact",
    "description",
    "reporter_name",
    "reporter_email",
    "postcode",
  ];
  const missing = required.filter((field) => !payload[field]);
  if (missing.length) {
    return { error: `Missing required fields: ${missing.join(", ")}` };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.reporter_email)) {
    return { error: "Reporter email address is invalid." };
  }

  return { payload };
}

async function createIncident(request, env) {
  const missing = missingConfig(env);
  if (missing.length) {
    return json({ error: "Supabase is not configured.", missing }, { status: 503 });
  }

  const parsed = await parseIncident(request);
  if (parsed.error) return json({ error: parsed.error }, { status: 400 });

  const url = `${supabaseBase(env)}?select=${incidentFields.join(",")}`;
  const response = await fetch(url, {
    method: "POST",
    headers: bearerHeaders(env, {
      "content-type": "application/json",
      prefer: "return=representation",
    }),
    body: JSON.stringify(parsed.payload),
  });

  const text = await response.text();
  if (!response.ok) {
    return json(
      { error: "Supabase rejected the incident insert.", detail: safeDetail(text) },
      { status: 502 },
    );
  }

  const rows = text ? JSON.parse(text) : [];
  return json({ incident: fromSupabase(rows[0]) }, { status: 201 });
}

async function listIncidents(request, env) {
  const auth = getWorkspaceIdentity(request, env);
  if (!auth.ok) return json({ error: auth.reason }, { status: auth.status });

  const missing = missingConfig(env);
  if (missing.length) {
    return json({ error: "Supabase is not configured.", missing }, { status: 503 });
  }

  const url = `${supabaseBase(env)}?select=${incidentFields.join(",")}&order=created_at.desc&limit=200`;
  const response = await fetch(url, { headers: bearerHeaders(env) });
  const text = await response.text();
  if (!response.ok) {
    return json(
      { error: "Supabase rejected the incident query.", detail: safeDetail(text) },
      { status: 502 },
    );
  }

  const rows = text ? JSON.parse(text) : [];
  return json({
    viewer: auth.viewer,
    incidents: rows.map(fromSupabase),
  });
}

function getWorkspaceIdentity(request, env) {
  const headers = request.headers;
  const bypass = headers.get("OAI-Sites-Authorization");
  if (env.SIWC_BYPASS_BEARER_TOKEN && bypass === `Bearer ${env.SIWC_BYPASS_BEARER_TOKEN}`) {
    return { ok: true, viewer: { email: "local-bypass", name: "Local test" } };
  }

  const email =
    headers.get("OpenAI-User-Email") ||
    headers.get("X-OpenAI-User-Email") ||
    headers.get("OAI-User-Email") ||
    headers.get("Cf-Access-Authenticated-User-Email");
  const name =
    headers.get("OpenAI-User-Name") ||
    headers.get("X-OpenAI-User-Name") ||
    headers.get("OAI-User-Name") ||
    email;

  if (!email) {
    return {
      ok: false,
      status: 401,
      reason: "Admin access requires workspace authentication.",
    };
  }

  const allowlist = String(env.ADMIN_EMAILS || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  if (allowlist.length && !allowlist.includes(email.toLowerCase())) {
    return {
      ok: false,
      status: 403,
      reason: "This workspace user is not on the admin allowlist.",
    };
  }

  return { ok: true, viewer: { email, name } };
}

function fromSupabase(row) {
  if (!row) return null;
  return {
    id: row.id,
    reference: row.reference,
    date: row.incident_date,
    time: row.incident_time,
    location: row.location,
    category: row.category,
    impact: row.impact,
    description: row.description,
    reporterName: row.reporter_name,
    reporterEmail: row.reporter_email,
    postcode: row.postcode,
    consentNetworkRail: row.consent_network_rail,
    consentCouncil: row.consent_council,
    consentMp: row.consent_mp,
    status: row.status || "Pending",
    createdAt: row.created_at,
  };
}

function safeDetail(text) {
  return text.slice(0, 800);
}

async function serveAsset(request, env) {
  const assets = env && (env.ASSETS || env.__STATIC_CONTENT);
  if (assets && typeof assets.fetch === "function") {
    const response = await assets.fetch(request);
    if (response.status !== 404) return response;

    const url = new URL(request.url);
    if (!url.pathname.includes(".")) {
      return assets.fetch(new Request(new URL("/index.html", url), request));
    }
  }

  return new Response("Saxmundham Rail Watch is deployed, but static assets are unavailable.", {
    status: 503,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/incidents" && request.method === "POST") {
      return createIncident(request, env);
    }

    if (url.pathname === "/api/incidents" && request.method === "GET") {
      return listIncidents(request, env);
    }

    if (url.pathname === "/api/admin/session" && request.method === "GET") {
      const auth = getWorkspaceIdentity(request, env);
      return auth.ok
        ? json({ viewer: auth.viewer })
        : json({ error: auth.reason }, { status: auth.status });
    }

    return serveAsset(request, env);
  },
};
