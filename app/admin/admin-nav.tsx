import Link from "next/link";
export function AdminNav({ name }: { name: string }) {
  return (
    <aside className="admin-nav">
      <strong>Administration</strong>
      <p>Signed in as {name}</p>
      <nav aria-label="Administration">
        <Link href="/admin">Dashboard</Link>
        <Link href="/admin/reports">All reports</Link>
        <Link href="/reports">Public register</Link>
        <Link href="/statistics">Statistics</Link>
      </nav>
      <form action="/api/admin/logout" method="post">
        <button className="button secondary" type="submit">
          Sign out
        </button>
      </form>
    </aside>
  );
}
