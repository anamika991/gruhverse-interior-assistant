"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { streamDesign } from "@/lib/api/design-service";
import type { DesignRecommendation, StreamEvent } from "@/lib/api/types";
import { useProjectStore } from "@/store/project-store";

const EXAMPLES = [
  "Make it more minimal and reduce the budget to ₹1.5 lakh.",
  "Shift this towards luxury with warmer brass accents.",
  "Keep the layout but make the palette cooler and greyer.",
];

export function ModifyPanel({
  design,
  onUpdated,
}: {
  design: DesignRecommendation;
  onUpdated: (next: DesignRecommendation) => void;
}) {
  const setCurrentDesign = useProjectStore((s) => s.setCurrentDesign);
  const [instruction, setInstruction] = useState("");
  const [status, setStatus] = useState<"idle" | "streaming" | "error">("idle");
  const [progress, setProgress] = useState<Extract<StreamEvent, { type: "progress" }>>();
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  async function submit() {
    if (instruction.trim().length < 8) {
      setError("Describe the change in a little more detail.");
      setStatus("error");
      return;
    }
    setStatus("streaming");
    setError("");
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    try {
      const next = await streamDesign(
        { instruction: instruction.trim(), currentDesign: design },
        (event) => {
          if (event.type === "progress") setProgress(event);
        },
        abortRef.current.signal,
      );
      setCurrentDesign(next);
      onUpdated(next);
      setInstruction("");
      setStatus("idle");
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setStatus("error");
      setError(err instanceof Error ? err.message : "Could not update the design.");
    }
  }

  return (
    <section
      aria-labelledby="modify-heading"
      className="rounded-2xl border border-line bg-card p-5"
    >
      <h2 id="modify-heading" className="font-serif text-2xl">
        Modify design
      </h2>
      <p className="mt-1 text-sm text-ink-soft">
        Speak to the scheme as you would to a designer. Style, budget and colour
        cues are understood.
      </p>
      <label htmlFor="instruction" className="sr-only">
        Modification instruction
      </label>
      <textarea
        id="instruction"
        rows={3}
        value={instruction}
        onChange={(e) => setInstruction(e.target.value)}
        placeholder="Make it more minimal and reduce the budget to ₹1.5 lakh."
        aria-invalid={status === "error"}
        className="mt-4 w-full resize-y rounded-xl border border-line bg-paper px-3 py-2.5 text-sm outline-none focus:border-copper focus:ring-2 focus:ring-copper/20"
      />
      {status === "error" ? (
        <p role="alert" className="mt-2 text-xs text-danger">
          {error}
        </p>
      ) : null}
      {status === "streaming" ? (
        <p className="mt-2 text-xs text-ink-soft" aria-live="polite">
          {progress?.message ?? "Updating…"} ({progress?.step ?? 0}/{progress?.total ?? 5})
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            className="rounded-full border border-line px-3 py-1 text-xs text-ink-soft hover:border-ink/40 hover:text-ink"
            onClick={() => setInstruction(example)}
          >
            {example}
          </button>
        ))}
      </div>
      <Button className="mt-4" onClick={submit} disabled={status === "streaming"}>
        {status === "streaming" ? "Updating design…" : "Apply modification"}
      </Button>
    </section>
  );
}
