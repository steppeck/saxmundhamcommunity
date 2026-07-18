import type { Metadata } from "next";
import { ActivationForm } from "./activation-form";

export const metadata: Metadata = { title: "Activate administrator account" };

export default function AdminActivationPage() {
  return (
    <section className="page-shell">
      <div className="reading-width">
        <div className="page-heading">
          <p className="eyebrow">Private administration</p>
          <h1>Activate your administrator account</h1>
          <p>Create the password you will use for the private dashboard.</p>
        </div>
        <ActivationForm />
      </div>
    </section>
  );
}
