import type { Metadata } from "next";
import Link from "next/link";
import { developmentWarning, siteConfig } from "@/config/site";
import "./styles.css";

export const metadata: Metadata = {
  title: { default: siteConfig.name, template: `%s | ${siteConfig.shortName}` },
  description: siteConfig.description,
};

const navigation = [
  ["/report", "Report noise"],
  ["/reports", "Public reports"],
  ["/statistics", "Statistics"],
  ["/how-it-works", "How it works"],
] as const;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to main content
        </a>
        {developmentWarning && process.env.NODE_ENV !== "production" ? (
          <div className="dev-warning" role="status">
            {developmentWarning}
          </div>
        ) : null}
        <header className="site-header">
          <div className="header-inner">
            <Link className="wordmark" href="/">
              <span aria-hidden="true">SR</span>
              <strong>{siteConfig.shortName}</strong>
            </Link>
            <nav aria-label="Main navigation">
              {navigation.map(([href, label]) => (
                <Link key={href} href={href}>
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main id="main">{children}</main>
        <footer className="site-footer">
          <div>
            <strong>{siteConfig.shortName}</strong>
            <p>{siteConfig.communityStatement}</p>
          </div>
          <nav aria-label="Footer navigation">
            <Link href="/privacy">Privacy</Link>
            <Link href="/accessibility">Accessibility</Link>
            <Link href="/how-it-works">How it works</Link>
            <Link href="/admin/login">Administrator login</Link>
          </nav>
        </footer>
      </body>
    </html>
  );
}
