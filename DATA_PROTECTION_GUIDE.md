# Data protection guide

## Data map

Residents submit structured incident facts and may add a name, email and private
comment. Supabase stores the data. Approved structured facts flow to the public
reports view, statistics and public CSV. Private data flows only to authenticated
administrator screens and separately protected administrative exports.

## Personal information record

- Optional name and email: checking a report or providing an update.
- Optional private comment: helping administrators understand a report.
- Administrator identity: access control and accountable moderation.
- Audit entries: status changes and personal-data deletion.

No IP address is intentionally stored. Netlify and Supabase may retain limited
technical logs under their own service terms; review provider settings.

## Processors and hosting

- Supabase: database, authentication and server-side database functions.
- Netlify: application hosting and request processing.
- GitHub: source control only; never store resident data or secrets there.

## Retention

The provisional contact-detail setting is 365 days. The final period is an owner
decision. Run a scheduled manual review monthly until an automated free-tier-safe
retention job is approved. Administrators can delete contact details immediately
while retaining the anonymised structured incident record.

## Subject access and deletion

1. Record the request date and verify the requester proportionately, normally
   using their report reference and email.
2. Search the protected admin area.
3. Export only the requester’s information.
4. Have a second administrator check the response where possible.
5. Send securely and record completion without copying the data into the audit.
6. For deletion, use “Delete name and email”; review private comments separately.

## Possible personal-data breach checklist

- Contain the incident without destroying evidence.
- Record what happened, when, affected records and likely consequences.
- Remove exposed access, rotate affected secrets and preserve relevant logs.
- Inform the data controller immediately.
- Assess notification duties and deadlines using current ICO guidance.
- Notify affected people where required using clear, practical advice.
- Record the decision, response and prevention work.

## Administrator handling

Use an individual admin account and a password manager. Do not share screenshots,
exports or private comments through personal messaging accounts. Export private
data only for a stated purpose, store it encrypted, restrict access and delete it
when finished. Never copy a service-role key into the browser or a report.
