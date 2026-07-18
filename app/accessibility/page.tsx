import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
export const metadata: Metadata = { title: "Accessibility" };
export default function AccessibilityPage() {
  return (
    <section className="page-shell">
      <div className="reading-width prose">
        <p className="eyebrow">Accessibility statement</p>
        <h1>Using this website</h1>
        <p className="lead">
          We want residents to be able to report an incident regardless of
          disability, device or confidence using websites.
        </p>
        <h2>What the website is designed to support</h2>
        <ul>
          <li>Keyboard-only use and strong visible focus</li>
          <li>Screen readers and meaningful labels</li>
          <li>Text zoom and mobile reflow</li>
          <li>Large controls and readable text</li>
          <li>Reduced motion preferences</li>
          <li>A step-by-step form with saved answers and clear errors</li>
        </ul>
        <h2>Accessibility target</h2>
        <p>
          The development target is WCAG 2.2 AA. Automated checks help find
          technical problems, but they cannot prove that the service is easy for
          everyone.
        </p>
        <h2>Known testing still required</h2>
        <p>
          Before describing the service as fully accessible, the owner should
          arrange testing with people who have cognitive or learning
          difficulties, low vision and motor impairments. The manual checklist
          in the project repository records the checks.
        </p>
        <h2>Tell us about a problem</h2>
        <p>
          Contact{" "}
          {siteConfig.privacyContact ||
            "[accessibility contact to be confirmed before launch]"}{" "}
          and explain the page and difficulty. Include your preferred way to
          receive a response.
        </p>
      </div>
    </section>
  );
}
