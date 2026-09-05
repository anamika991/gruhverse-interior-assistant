"use client";

import { useEffect, useMemo, useState } from "react";
import { MaterialCard } from "@/components/materials/MaterialCard";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { fetchMaterials } from "@/lib/api/material-service";
import { MATERIAL_CATEGORIES, type Material, type MaterialCategory } from "@/lib/api/types";
import { CATEGORY_LABEL, formatInr } from "@/lib/format";
import { inputClass } from "@/components/ui/Field";
import { useProjectStore } from "@/store/project-store";

export function MaterialCatalogue() {
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [category, setCategory] = useState<MaterialCategory | "">("");
  const [retry, setRetry] = useState(0);
  const requestKey = `${debounced}|${category}|${retry}`;
  const [snapshot, setSnapshot] = useState<{
    key: string;
    status: "success" | "error";
    items: Material[];
    error: string;
  } | null>(null);
  const project = useProjectStore((s) => s.projectMaterials);
  const remove = useProjectStore((s) => s.removeFromProject);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q), 250);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    let cancelled = false;
    fetchMaterials({ q: debounced, category })
      .then((res) => {
        if (cancelled) return;
        setSnapshot({
          key: requestKey,
          status: "success",
          items: res.items,
          error: "",
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setSnapshot({
          key: requestKey,
          status: "error",
          items: [],
          error: err instanceof Error ? err.message : "Could not load materials.",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [debounced, category, retry, requestKey]);

  const status = snapshot?.key === requestKey ? snapshot.status : "loading";
  const items = snapshot?.key === requestKey ? snapshot.items : [];
  const error = snapshot?.key === requestKey ? snapshot.error : "";

  const projectTotal = useMemo(
    () => project.reduce((sum, m) => sum + m.indicativePriceInr * m.quantity, 0),
    [project],
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
      <div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="material-search">
            Search materials
          </label>
          <input
            id="material-search"
            className={inputClass}
            placeholder="Search plywood, laminate, linen…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <label className="sr-only" htmlFor="material-category">
            Category
          </label>
          <select
            id="material-category"
            className={`${inputClass} sm:max-w-[220px]`}
            value={category}
            onChange={(e) => setCategory(e.target.value as MaterialCategory | "")}
          >
            <option value="">All categories</option>
            {MATERIAL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABEL[c]}
              </option>
            ))}
          </select>
        </div>

        {status === "loading" ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Loading materials">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        ) : null}

        {status === "error" ? (
          <div className="mt-6">
            <ErrorState body={error} onRetry={() => setRetry((n) => n + 1)} />
          </div>
        ) : null}

        {status === "success" && items.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="No materials found"
              body="Try another search or clear the category filter."
              actionLabel="Clear filters"
              onAction={() => {
                setQ("");
                setCategory("");
              }}
            />
          </div>
        ) : null}

        {status === "success" && items.length > 0 ? (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((material) => (
              <li key={material.id}>
                <MaterialCard material={material} />
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <aside className="h-fit rounded-2xl border border-line bg-card p-4 lg:sticky lg:top-20">
        <h2 className="font-serif text-xl">Project basket</h2>
        {project.length === 0 ? (
          <p className="mt-2 text-sm text-ink-soft">
            Add finishes from the catalogue. They stay with this browser session.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {project.map((item) => (
              <li key={item.materialId} className="text-sm">
                <div className="flex justify-between gap-2">
                  <span>{item.name}</span>
                  <button
                    type="button"
                    className="text-xs text-ink-soft hover:text-danger"
                    onClick={() => remove(item.materialId)}
                  >
                    Remove
                  </button>
                </div>
                <p className="text-xs text-ink-soft">
                  {item.quantity} × {formatInr(item.indicativePriceInr)}
                </p>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 border-t border-line pt-3 text-sm">
          Indicative total{" "}
          <span className="float-right tabular-nums">{formatInr(projectTotal)}</span>
        </p>
      </aside>
    </div>
  );
}
