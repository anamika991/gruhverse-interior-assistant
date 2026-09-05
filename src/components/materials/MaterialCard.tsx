"use client";

import Image from "next/image";
import { Button } from "@/components/ui/Button";
import type { Material } from "@/lib/api/types";
import { AVAILABILITY_LABEL, CATEGORY_LABEL, formatInr } from "@/lib/format";
import { useProjectStore } from "@/store/project-store";

export function MaterialCard({ material }: { material: Material }) {
  const addToProject = useProjectStore((s) => s.addToProject);
  const added = useProjectStore((s) =>
    s.projectMaterials.some((m) => m.materialId === material.id),
  );

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-line bg-card">
      <div className="relative aspect-[4/3]">
        <Image
          src={material.imageUrl}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 33vw"
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] uppercase tracking-[0.16em] text-ink-soft">
          {CATEGORY_LABEL[material.category]}
        </p>
        <h3 className="mt-1 font-medium leading-snug">{material.name}</h3>
        <p className="mt-1 flex-1 text-sm text-ink-soft">{material.description}</p>
        <div className="mt-3 flex items-center justify-between gap-2 text-sm">
          <p className="tabular-nums">
            {formatInr(material.indicativePriceInr)}
            <span className="text-ink-soft"> / {material.unit}</span>
          </p>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] ${
              material.availability === "IN_STOCK"
                ? "bg-[#e4eee4] text-sage"
                : material.availability === "LIMITED"
                  ? "bg-[#f6e6dc] text-copper-dark"
                  : "bg-paper-2 text-ink-soft"
            }`}
          >
            {AVAILABILITY_LABEL[material.availability]}
          </span>
        </div>
        <Button
          variant="secondary"
          className="mt-4 w-full"
          disabled={added}
          onClick={() =>
            addToProject({
              materialId: material.id,
              name: material.name,
              category: material.category,
              indicativePriceInr: material.indicativePriceInr,
              unit: material.unit,
              quantity: 1,
            })
          }
        >
          {added ? "Added to project" : "Add to project"}
        </Button>
      </div>
    </article>
  );
}
