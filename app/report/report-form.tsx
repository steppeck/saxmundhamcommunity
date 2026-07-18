"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import {
  disruptionLevels,
  durations,
  effects,
  experiencedAt,
  frequencies,
  noiseTypes,
  reportTimings,
  windowStates,
} from "@/lib/options";

type Data = {
  incidentDate: string;
  approximateTime: string;
  broadArea: string;
  noiseType: string;
  duration: string;
  experiencedAt: string;
  windowState: string;
  effects: string[];
  disruptionLevel: string;
  frequency: string;
  reportTiming: string;
  privateComments: string;
  reporterName: string;
  reporterEmail: string;
  accuracyConfirmed: boolean;
  updatesOptIn: boolean;
  website: string;
};

const initial: Data = {
  incidentDate: "",
  approximateTime: "",
  broadArea: "",
  noiseType: "",
  duration: "",
  experiencedAt: "",
  windowState: "",
  effects: [],
  disruptionLevel: "",
  frequency: "",
  reportTiming: "",
  privateComments: "",
  reporterName: "",
  reporterEmail: "",
  accuracyConfirmed: false,
  updatesOptIn: false,
  website: "",
};

const steps = [
  "When and where",
  "What happened",
  "Effect",
  "Pattern",
  "Private details",
  "Check answers",
];

export function ReportForm() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Data>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [reference, setReference] = useState("");
  const submissionToken = useMemo(() => crypto.randomUUID(), []);

  function update<K extends keyof Data>(key: K, value: Data[K]) {
    setData((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  }

  function validate(currentStep: number) {
    const next: Record<string, string> = {};
    const need = (key: keyof Data, message: string) => {
      const value = data[key];
      if (!value || (Array.isArray(value) && !value.length))
        next[key] = message;
    };
    if (currentStep === 0) {
      need("incidentDate", "Enter the date.");
      need("approximateTime", "Enter an approximate time.");
      need("broadArea", "Choose a broad area.");
      if (
        data.incidentDate &&
        new Date(`${data.incidentDate}T23:59:59`) > new Date()
      )
        next.incidentDate = "The date cannot be in the future.";
    }
    if (currentStep === 1) {
      need("noiseType", "Choose the type of noise or disturbance.");
      need("duration", "Choose how long it lasted.");
      need("experiencedAt", "Choose where you experienced it.");
      if (data.experiencedAt && data.experiencedAt !== "Outdoors")
        need("windowState", "Choose the window position.");
    }
    if (currentStep === 2) {
      need("effects", "Choose at least one effect.");
      need("disruptionLevel", "Choose the overall disruption.");
    }
    if (currentStep === 3) {
      need("frequency", "Choose how frequently this happens.");
      need("reportTiming", "Choose when you are making this report.");
    }
    if (
      currentStep === 4 &&
      data.reporterEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.reporterEmail)
    )
      next.reporterEmail = "Enter a valid email address, or leave it blank.";
    if (currentStep === 5 && !data.accuracyConfirmed)
      next.accuracyConfirmed =
        "Confirm that the information is accurate before submitting.";
    setErrors(next);
    if (Object.keys(next).length) {
      document.getElementById("error-summary")?.focus();
      return false;
    }
    return true;
  }

  function continueForm() {
    if (validate(step)) {
      setStep((current) => Math.min(current + 1, steps.length - 1));
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }

  async function submit() {
    if (!validate(5) || saving) return;
    setSaving(true);
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...data, submissionToken }),
      });
      const result = await response.json();
      if (!response.ok) {
        setErrors(
          result.errors || {
            form: result.error || "We could not save the report. Try again.",
          },
        );
        setSaving(false);
        return;
      }
      setReference(result.reference);
    } catch {
      setErrors({
        form: "We could not connect to the service. Your answers are still here.",
      });
      setSaving(false);
    }
  }

  if (reference) {
    return (
      <div className="confirmation" role="status">
        <h2>Your report has been received</h2>
        <p>
          It is private and pending review. It will not appear publicly unless a
          community administrator approves it.
        </p>
        <p>Your reference number is:</p>
        <p className="reference">{reference}</p>
        <div className="actions">
          <button
            className="button primary"
            type="button"
            onClick={() => window.print()}
          >
            Print confirmation
          </button>
          <Link className="button secondary" href="/">
            Return to the home page
          </Link>
        </div>
      </div>
    );
  }

  const fields = Object.entries(errors).filter(([, message]) => message);
  return (
    <form onSubmit={(event) => event.preventDefault()} noValidate>
      <div
        className="progress"
        aria-label={`Step ${step + 1} of ${steps.length}: ${steps[step]}`}
      >
        <p>
          Step {step + 1} of {steps.length}: {steps[step]}
        </p>
        <div className="progress-track" aria-hidden="true">
          <span style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
        </div>
      </div>
      {fields.length ? (
        <div
          id="error-summary"
          className="error-summary"
          role="alert"
          tabIndex={-1}
        >
          <h2>Check your answers</h2>
          <ul>
            {fields.map(([field, message]) => (
              <li key={field}>
                <a href={`#${field}`}>{message}</a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {step === 0 && (
        <>
          <Field
            id="incidentDate"
            label="What date did it happen?"
            error={errors.incidentDate}
          >
            <input
              id="incidentDate"
              type="date"
              value={data.incidentDate}
              onChange={(e) => update("incidentDate", e.target.value)}
              aria-describedby={
                errors.incidentDate ? "incidentDate-error" : undefined
              }
            />
          </Field>
          <Field
            id="approximateTime"
            label="About what time did it happen?"
            hint="An approximate time is fine."
            error={errors.approximateTime}
          >
            <input
              id="approximateTime"
              type="time"
              value={data.approximateTime}
              onChange={(e) => update("approximateTime", e.target.value)}
            />
          </Field>
          <ChoiceField
            id="broadArea"
            label="Which broad area of Saxmundham?"
            options={siteConfig.locations}
            value={data.broadArea}
            onChange={(v) => update("broadArea", v)}
            error={errors.broadArea}
          />
        </>
      )}

      {step === 1 && (
        <>
          <ChoiceField
            id="noiseType"
            label="What type of noise or disturbance was it?"
            options={noiseTypes}
            value={data.noiseType}
            onChange={(v) => update("noiseType", v)}
            error={errors.noiseType}
          />
          <ChoiceField
            id="duration"
            label="About how long did it last?"
            options={durations}
            value={data.duration}
            onChange={(v) => update("duration", v)}
            error={errors.duration}
          />
          <ChoiceField
            id="experiencedAt"
            label="Where did you experience it?"
            options={experiencedAt}
            value={data.experiencedAt}
            onChange={(v) => update("experiencedAt", v)}
            error={errors.experiencedAt}
          />
          {data.experiencedAt && data.experiencedAt !== "Outdoors" ? (
            <ChoiceField
              id="windowState"
              label="What was the window position?"
              options={windowStates}
              value={data.windowState}
              onChange={(v) => update("windowState", v)}
              error={errors.windowState}
            />
          ) : null}
        </>
      )}

      {step === 2 && (
        <>
          <fieldset className="field" id="effects">
            <legend>What effect did it have? Choose all that apply.</legend>
            {errors.effects && (
              <p className="error" id="effects-error">
                {errors.effects}
              </p>
            )}
            <div className="choice-list">
              {effects.map((option) => (
                <label className="choice" key={option}>
                  <input
                    type="checkbox"
                    checked={data.effects.includes(option)}
                    onChange={(e) =>
                      update(
                        "effects",
                        e.target.checked
                          ? [...data.effects, option]
                          : data.effects.filter((item) => item !== option),
                      )
                    }
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <ChoiceField
            id="disruptionLevel"
            label="Overall, how disruptive was it?"
            options={disruptionLevels}
            value={data.disruptionLevel}
            onChange={(v) => update("disruptionLevel", v)}
            error={errors.disruptionLevel}
          />
        </>
      )}

      {step === 3 && (
        <>
          <ChoiceField
            id="frequency"
            label="How often do you experience this type of disturbance?"
            options={frequencies}
            value={data.frequency}
            onChange={(v) => update("frequency", v)}
            error={errors.frequency}
          />
          <ChoiceField
            id="reportTiming"
            label="When are you making this report?"
            options={reportTimings}
            value={data.reportTiming}
            onChange={(v) => update("reportTiming", v)}
            error={errors.reportTiming}
          />
        </>
      )}

      {step === 4 && (
        <>
          <Field
            id="privateComments"
            label="Private comments - not published"
            hint="You can add anything that may help the community administrators understand your report. Do not include information about other people unless it is necessary. These comments will not appear on the public website."
            error={errors.privateComments}
          >
            <textarea
              id="privateComments"
              maxLength={2000}
              value={data.privateComments}
              onChange={(e) => update("privateComments", e.target.value)}
            />
          </Field>
          <div className="notice">
            <strong>Contact details are optional.</strong>
            <p>
              They may help us check a report or provide an update. They will
              never be published.
            </p>
          </div>
          <Field
            id="reporterName"
            label="Your name (optional)"
            error={errors.reporterName}
          >
            <input
              id="reporterName"
              autoComplete="name"
              value={data.reporterName}
              onChange={(e) => update("reporterName", e.target.value)}
            />
          </Field>
          <Field
            id="reporterEmail"
            label="Your email address (optional)"
            error={errors.reporterEmail}
          >
            <input
              id="reporterEmail"
              type="email"
              autoComplete="email"
              value={data.reporterEmail}
              onChange={(e) => update("reporterEmail", e.target.value)}
            />
          </Field>
          <div className="sr-only" aria-hidden="true">
            <label htmlFor="website">Leave this blank</label>
            <input
              id="website"
              tabIndex={-1}
              autoComplete="off"
              value={data.website}
              onChange={(e) => update("website", e.target.value)}
            />
          </div>
        </>
      )}

      {step === 5 && (
        <>
          <h2>Check your answers</h2>
          <dl className="review-list">
            {[
              ["Date", data.incidentDate, 0],
              ["Approximate time", data.approximateTime, 0],
              ["Broad area", data.broadArea, 0],
              ["Noise type", data.noiseType, 1],
              ["Duration", data.duration, 1],
              ["Experienced", data.experiencedAt, 1],
              ["Effects", data.effects.join("; "), 2],
              ["Disruption", data.disruptionLevel, 2],
              ["Frequency", data.frequency, 3],
              ["Report timing", data.reportTiming, 3],
              ["Private comments", data.privateComments || "None", 4],
              ["Name", data.reporterName || "Not provided", 4],
              ["Email", data.reporterEmail || "Not provided", 4],
            ].map(([label, value, target]) => (
              <div className="review-row" key={String(label)}>
                <dt>{label}</dt>
                <dd>{value}</dd>
                <dd>
                  <button
                    className="text-link"
                    type="button"
                    onClick={() => setStep(Number(target))}
                  >
                    Change
                  </button>
                </dd>
              </div>
            ))}
          </dl>
          <div className="notice">
            <strong>Before you submit</strong>
            <p>
              Your structured answers may be published after review. Your name,
              email address and private comments will never be published.
            </p>
          </div>
          <label className="choice" id="accuracyConfirmed">
            <input
              type="checkbox"
              checked={data.accuracyConfirmed}
              onChange={(e) => update("accuracyConfirmed", e.target.checked)}
            />
            <span>
              To the best of my knowledge, the information I have provided is
              accurate.
            </span>
          </label>
          {errors.accuracyConfirmed && (
            <p className="error">{errors.accuracyConfirmed}</p>
          )}
          <label className="choice">
            <input
              type="checkbox"
              checked={data.updatesOptIn}
              onChange={(e) => update("updatesOptIn", e.target.checked)}
            />
            <span>
              I would like to receive email updates about the challenges
              Saxmundham faces with increased traffic on rail and road.
            </span>
          </label>
        </>
      )}

      <div className="form-actions">
        {step > 0 ? (
          <button
            className="button secondary"
            type="button"
            onClick={() => setStep((current) => current - 1)}
          >
            Back
          </button>
        ) : (
          <span />
        )}
        {step < steps.length - 1 ? (
          <button
            className="button primary"
            type="button"
            onClick={continueForm}
          >
            Continue
          </button>
        ) : (
          <button
            className="button primary"
            type="button"
            disabled={saving}
            onClick={submit}
          >
            {saving ? "Submitting report..." : "Submit report"}
          </button>
        )}
      </div>
      <p aria-live="polite" className="sr-only">
        {saving ? "Submitting your report" : ""}
      </p>
    </form>
  );
}

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {hint && (
        <span className="hint" id={`${id}-hint`}>
          {hint}
        </span>
      )}
      {error && (
        <p className="error" id={`${id}-error`}>
          {error}
        </p>
      )}
      {children}
    </div>
  );
}

function ChoiceField({
  id,
  label,
  options,
  value,
  onChange,
  error,
}: {
  id: string;
  label: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <fieldset className="field" id={id}>
      <legend>{label}</legend>
      {error && (
        <p className="error" id={`${id}-error`}>
          {error}
        </p>
      )}
      <div className="choice-list">
        {options.map((option) => (
          <label className="choice" key={option}>
            <input
              type="radio"
              name={id}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
