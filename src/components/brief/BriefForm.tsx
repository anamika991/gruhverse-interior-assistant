"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RoomImageField } from "@/components/brief/RoomImageField";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/ui/Field";
import { ErrorState } from "@/components/ui/EmptyState";
import { streamDesign } from "@/lib/api/design-service";
import { DESIGN_STYLES, ROOM_TYPES, type StreamEvent } from "@/lib/api/types";
import { formatBudgetInput, ROOM_TYPE_LABEL, STYLE_LABEL } from "@/lib/format";
import {
  firstBriefError,
  formValuesToBrief,
  validateBriefForm,
  validateImageFile,
  type BriefFormValues,
} from "@/lib/validation/brief";
import { useProjectStore } from "@/store/project-store";

const initialValues: BriefFormValues = {
  roomType: "LIVING_ROOM",
  lengthFt: "16",
  widthFt: "12",
  budgetInr: "2,50,000",
  style: "MODERN",
  colourPreference: "Warm beige",
};

export function BriefForm() {
  const router = useRouter();
  const setCurrentDesign = useProjectStore((s) => s.setCurrentDesign);
  const [values, setValues] = useState<BriefFormValues>(initialValues);
  const [errors, setErrors] = useState<ReturnType<typeof validateBriefForm>>({});
  const [imageName, setImageName] = useState<string>();
  const [imagePreview, setImagePreview] = useState<string>();
  const [imageError, setImageError] = useState<string>();
  const [status, setStatus] = useState<"idle" | "streaming" | "error">("idle");
  const [progress, setProgress] = useState<Extract<StreamEvent, { type: "progress" }>>();
  const [errorMessage, setErrorMessage] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const area = useMemo(() => {
    const l = Number(values.lengthFt);
    const w = Number(values.widthFt);
    if (!l || !w) return null;
    return l * w;
  }, [values.lengthFt, values.widthFt]);

  function update<K extends keyof BriefFormValues>(key: K, value: BriefFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function onFile(file: File | null) {
    if (!file) {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImageName(undefined);
      setImagePreview(undefined);
      setImageError(undefined);
      return;
    }
    const err = validateImageFile(file);
    if (err) {
      setImageError(err);
      return;
    }
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageError(undefined);
    setImageName(file.name);
    setImagePreview(URL.createObjectURL(file));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors = validateBriefForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length || imageError) {
      const first = firstBriefError(nextErrors);
      if (first) document.getElementById(first)?.focus();
      return;
    }

    setStatus("streaming");
    setErrorMessage("");
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    try {
      const brief = formValuesToBrief(values, imageName);
      const design = await streamDesign(
        { brief },
        (event) => {
          if (event.type === "progress") setProgress(event);
        },
        abortRef.current.signal,
      );
      setCurrentDesign(design);
      router.push(`/design/${design.id}`);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Could not generate a design.");
    }
  }

  if (status === "streaming") {
    const percent = progress ? (progress.step / progress.total) * 100 : 8;
    return (
      <div
        className="rounded-2xl border border-line bg-ink px-6 py-10 text-paper sm:px-10"
        aria-live="polite"
        aria-busy="true"
      >
        <p className="text-[11px] uppercase tracking-[0.24em] text-paper/60">
          Composing
        </p>
        <h2 className="mt-2 font-serif text-3xl">Your scheme is taking shape</h2>
        <p className="mt-3 max-w-md text-sm text-paper/70">
          {progress?.message ?? "Connecting to the design service…"}
        </p>
        <div
          className="mt-8 h-1 overflow-hidden rounded-full bg-white/10"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={progress?.total ?? 5}
          aria-valuenow={progress?.step ?? 0}
          aria-label="Design generation progress"
        >
          <div
            className="h-full bg-copper transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="mt-3 text-xs text-paper/50">
          Step {progress?.step ?? 0} of {progress?.total ?? 5}
        </p>
      </div>
    );
  }

  const errorCount = Object.keys(errors).length + (imageError ? 1 : 0);

  return (
    <form onSubmit={onSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
      {status === "error" ? (
        <div className="mb-4">
          <ErrorState body={errorMessage} onRetry={() => setStatus("idle")} />
        </div>
      ) : null}

      {errorCount > 0 ? (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-danger/20 bg-[#f8ece8] px-3 py-2 text-xs text-danger"
        >
          Please fix {errorCount} {errorCount === 1 ? "field" : "fields"} before generating.
        </div>
      ) : null}

      <div className="flex flex-col gap-4 pb-24 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pb-1">
        <fieldset aria-required="true">
          <legend className="mb-1.5 text-sm font-medium">Room type</legend>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Room type">
            {ROOM_TYPES.map((type) => {
              const selected = values.roomType === type;
              return (
                <label
                  key={type}
                  className={`cursor-pointer rounded-xl border px-2 py-2.5 text-center text-sm transition ${
                    selected
                      ? "border-ink bg-ink text-paper"
                      : "border-line bg-card hover:border-ink/30"
                  }`}
                >
                  <input
                    className="sr-only"
                    type="radio"
                    name="roomType"
                    value={type}
                    checked={selected}
                    onChange={() => update("roomType", type)}
                  />
                  {ROOM_TYPE_LABEL[type]}
                </label>
              );
            })}
          </div>
          {errors.roomType ? (
            <p className="mt-1 text-xs text-danger">{errors.roomType}</p>
          ) : null}
        </fieldset>

        <div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field id="lengthFt" label="Length (ft)" error={errors.lengthFt}>
              <input
                id="lengthFt"
                className={inputClass}
                inputMode="decimal"
                value={values.lengthFt}
                onChange={(e) => update("lengthFt", e.target.value)}
                aria-invalid={Boolean(errors.lengthFt)}
                aria-describedby={errors.lengthFt ? "lengthFt-error" : undefined}
              />
            </Field>
            <Field id="widthFt" label="Width (ft)" error={errors.widthFt}>
              <input
                id="widthFt"
                className={inputClass}
                inputMode="decimal"
                value={values.widthFt}
                onChange={(e) => update("widthFt", e.target.value)}
                aria-invalid={Boolean(errors.widthFt)}
                aria-describedby={errors.widthFt ? "widthFt-error" : undefined}
              />
            </Field>
          </div>
          {area ? (
            <p className="mt-1.5 text-xs text-ink-soft">Floor area ≈ {area} sq.ft</p>
          ) : null}
        </div>

        <Field
          id="budgetInr"
          label="Budget"
          hint="Inclusive of furniture, materials and labour."
          error={errors.budgetInr}
        >
          <div className="relative">
            <span
              className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-ink-soft"
              aria-hidden
            >
              ₹
            </span>
            <input
              id="budgetInr"
              className={`${inputClass} pl-7 tabular-nums`}
              inputMode="numeric"
              autoComplete="off"
              value={values.budgetInr}
              onChange={(e) => update("budgetInr", formatBudgetInput(e.target.value))}
              aria-invalid={Boolean(errors.budgetInr)}
              aria-describedby={
                errors.budgetInr ? "budgetInr-error" : "budgetInr-hint"
              }
            />
          </div>
        </Field>

        <fieldset>
          <legend className="mb-1.5 text-sm font-medium">Design style</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Design style">
            {DESIGN_STYLES.map((style) => {
              const selected = values.style === style;
              return (
                <label
                  key={style}
                  className={`cursor-pointer rounded-xl border px-2 py-2.5 text-center text-sm transition ${
                    selected
                      ? "border-copper bg-[#f6e6dc] text-copper-dark"
                      : "border-line bg-card hover:border-ink/30"
                  }`}
                >
                  <input
                    className="sr-only"
                    type="radio"
                    name="style"
                    value={style}
                    checked={selected}
                    onChange={() => update("style", style)}
                  />
                  {STYLE_LABEL[style]}
                </label>
              );
            })}
          </div>
        </fieldset>

        <Field
          id="colourPreference"
          label="Colour preference"
          hint="E.g. sage, warm beige, monochrome."
          error={errors.colourPreference}
        >
          <input
            id="colourPreference"
            className={inputClass}
            value={values.colourPreference}
            onChange={(e) => update("colourPreference", e.target.value)}
            aria-invalid={Boolean(errors.colourPreference)}
            aria-describedby={
              errors.colourPreference
                ? "colourPreference-error"
                : "colourPreference-hint"
            }
          />
        </Field>

        <RoomImageField
          fileName={imageName}
          previewUrl={imagePreview}
          error={imageError}
          onFile={onFile}
        />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:static lg:z-auto lg:mt-4 lg:shrink-0 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
        <Button type="submit" className="h-12 w-full text-[15px] shadow-[0_8px_24px_-12px_rgba(196,92,38,0.85)]">
          Generate design
        </Button>
      </div>
    </form>
  );
}
