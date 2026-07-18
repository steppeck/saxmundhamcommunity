"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { publicSupabase } from "@/lib/supabase";

type ActivationState = "checking" | "ready" | "complete" | "invalid";

export function ActivationForm() {
  const clientRef = useRef<ReturnType<typeof publicSupabase> | null>(null);
  const [state, setState] = useState<ActivationState>("checking");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function acceptInvitation() {
      const client = publicSupabase();
      clientRef.current = client;
      const hash = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");
      const code = new URLSearchParams(window.location.search).get("code");

      let invitationError: Error | null = null;
      if (accessToken && refreshToken) {
        const result = await client.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        invitationError = result.error;
      } else if (code) {
        const result = await client.auth.exchangeCodeForSession(code);
        invitationError = result.error;
      } else {
        invitationError = new Error("The invitation link is incomplete.");
      }

      if (active) setState(invitationError ? "invalid" : "ready");
    }

    void acceptInvitation();
    return () => {
      active = false;
    };
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") || "");
    const confirmation = String(form.get("passwordConfirmation") || "");

    if (password.length < 12) {
      setError("Choose a password with at least 12 characters.");
      return;
    }
    if (password !== confirmation) {
      setError("The two passwords do not match.");
      return;
    }

    setLoading(true);
    const result = await clientRef.current?.auth.updateUser({ password });
    if (!result || result.error) {
      setError(
        result?.error.message ||
          "The password could not be saved. Request a new invitation.",
      );
      setLoading(false);
      return;
    }

    await clientRef.current?.auth.signOut();
    window.history.replaceState(null, "", "/admin/activate");
    setState("complete");
    setLoading(false);
  }

  if (state === "checking") {
    return (
      <div className="login-panel" role="status">
        Checking your invitation...
      </div>
    );
  }

  if (state === "invalid") {
    return (
      <div className="error-summary" role="alert">
        This invitation is invalid or has expired. Ask the site owner to send a
        new administrator invitation.
      </div>
    );
  }

  if (state === "complete") {
    return (
      <div className="login-panel" role="status">
        <h2>Password created</h2>
        <p>Your administrator account is ready.</p>
        <Link className="button primary" href="/admin/login">
          Continue to administrator login
        </Link>
      </div>
    );
  }

  return (
    <form className="login-panel" onSubmit={submit}>
      {error && (
        <div className="error-summary" role="alert">
          {error}
        </div>
      )}
      <div className="field">
        <label htmlFor="password">Create a password</label>
        <span className="hint" id="password-hint">
          Use at least 12 characters.
        </span>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          aria-describedby="password-hint"
          minLength={12}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="passwordConfirmation">Confirm your password</label>
        <input
          id="passwordConfirmation"
          name="passwordConfirmation"
          type="password"
          autoComplete="new-password"
          minLength={12}
          required
        />
      </div>
      <button className="button primary" disabled={loading}>
        {loading ? "Creating account..." : "Create administrator account"}
      </button>
    </form>
  );
}
