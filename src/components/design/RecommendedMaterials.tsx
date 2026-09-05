"use client";

import Link from "next/link";
import type { MaterialRecommendation } from "@/lib/api/types";
import { CATEGORY_LABEL, formatInr } from "@/lib/format";
import { useProjectStore } from "@/store/project-store";
import { Button } from "@/components/ui/Button";

export function RecommendedMaterials({
  items,
}: {
  items: MaterialRecommendation[];
}) {
  const addToProject = useProjectStore((s) => s.addToProject);
  const added = useProjectStore((s) => s.projectMaterials);

  return (
    <section aria-labelledby="spec-heading">
      <div className="flex items-end justify-between gap-3">
        <h2 id="spec-heading" className="font-serif text-2xl">
          Materials
        </h2>
        <Link href="/materials" className="text-sm text-copper hover:underline">
          Browse catalogue
        </Link>
      </div>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {items.map((item) => {
          const inProject = added.some((m) => m.materialId === item.materialId);
          return (
            <li
              key={item.materialId}
              className="flex flex-col justify-between rounded-2xl border border-line bg-card p-4"
            >
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-ink-soft">
                  {CATEGORY_LABEL[item.category]}
                </p>
                <p className="mt-1 font-medium">{item.name}</p>
                <p className="mt-1 text-sm text-ink-soft">{item.usage}</p>
                <p className="mt-2 text-sm tabular-nums">
                  {formatInr(item.indicativePriceInr)}
                </p>
              </div>
              <Button
                variant="secondary"
                className="mt-3"
                disabled={inProject}
                onClick={() =>
                  addToProject({
                    materialId: item.materialId,
                    name: item.name,
                    category: item.category,
                    indicativePriceInr: item.indicativePriceInr,
                    unit: "indicative",
                    quantity: 1,
                  })
                }
              >
                {inProject ? "Added" : "Add to project"}
              </Button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
