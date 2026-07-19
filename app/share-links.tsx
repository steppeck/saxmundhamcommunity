"use client";

import { useState } from "react";

export function ShareLinks({
  title,
  text,
  url,
}: {
  title: string;
  text: string;
  url: string;
}) {
  const [message, setMessage] = useState("");
  const encodedUrl = encodeURIComponent(url);
  const emailHref = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setMessage("Link copied.");
    } catch {
      setMessage("Copying failed. You can copy the address from your browser.");
    }
  }

  async function share() {
    if (!navigator.share) {
      await copyLink();
      return;
    }
    try {
      await navigator.share({ title, text, url });
      setMessage("Sharing options opened.");
    } catch {
      setMessage("");
    }
  }

  return (
    <div>
      <div className="actions share-actions">
        <button className="button secondary" type="button" onClick={share}>
          Share
        </button>
        <a
          className="button secondary"
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Facebook
        </a>
        <a className="button secondary" href={emailHref}>
          Email
        </a>
        <button className="button secondary" type="button" onClick={copyLink}>
          Copy link
        </button>
      </div>
      <p className="share-message" aria-live="polite">
        {message}
      </p>
    </div>
  );
}
