import Link from "next/link";
export function AdminNav({ name }: { name: string }) {
  return (
    <div className="admin-nav">
      <div className="admin-identity">
        <strong>Administration</strong>
        <span>Signed in as {name}</span>
      </div>
      <nav aria-label="Administration">
        <Link href="/admin">Dashboard</Link>
        <Link href="/admin/reports">All reports</Link>
        <Link href="/statistics">Statistics</Link>
        <a href="/api/admin/export">Evidence spreadsheet</a>
      </nav>
      <form action="/api/admin/logout" method="post">
        <button className="button secondary" type="submit">
          Sign out
        </button>
      </form>
    </div>
  );
}
