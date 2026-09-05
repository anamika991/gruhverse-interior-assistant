"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { DesignRecommendation } from "@/lib/api/types";
import { formatInr, ROOM_TYPE_LABEL, STYLE_LABEL } from "@/lib/format";
import { useProjectStore } from "@/store/project-store";
import { BudgetPanel } from "@/components/design/BudgetPanel";
import { ColourPalette } from "@/components/design/ColourPalette";
import { FurnitureList } from "@/components/design/FurnitureList";
import { ModifyPanel } from "@/components/design/ModifyPanel";
import { RecommendedMaterials } from "@/components/design/RecommendedMaterials";

export function DesignResult({
  design,
  onDesignChange,
}: {
  design: DesignRecommendation;
  onDesignChange: (next: DesignRecommendation) => void;
}) {
  const history = useProjectStore((s) => s.history);
  const router = useRouter();

  return (
    <article className="animate-fade-up flex flex-col gap-10">
      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.95fr]">
        <div className="overflow-hidden rounded-2xl border border-line bg-card">
          <div className="relative aspect-[16/11]">
            <Image
              src={design.imageUrl}
              alt={design.imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 60vw"
              priority
            />
          </div>
          <div className="px-5 py-4">
            <p className="text-[11px] uppercase tracking-[0.2em] text-ink-soft">
              {ROOM_TYPE_LABEL[design.brief.roomType]} · {STYLE_LABEL[design.brief.style]}
            </p>
            <h1 className="mt-1 font-serif text-3xl sm:text-4xl">{design.title}</h1>
            <p className="mt-2 text-sm leading-6 text-ink-soft">{design.summary}</p>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <BudgetPanel budget={design.budget} />
          <ul className="rounded-2xl border border-line bg-card p-5 text-sm text-ink-soft">
            {design.designerNotes.map((note) => (
              <li key={note} className="mb-2 last:mb-0">
                {note}
              </li>
            ))}
          </ul>
          {design.photoInsights && design.photoInsights.length > 0 ? (
            <section
              aria-labelledby="photo-insights-heading"
              className="rounded-2xl border border-line bg-card p-5"
            >
              <h2 id="photo-insights-heading" className="font-serif text-xl">
                From your room photo
              </h2>
              <ul className="mt-3 space-y-3">
                {design.photoInsights.map((insight) => (
                  <li key={insight.title}>
                    <p className="text-sm font-medium">{insight.title}</p>
                    <p className="mt-0.5 text-sm text-ink-soft">{insight.detail}</p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>

      <ColourPalette palette={design.palette} />
      <FurnitureList items={design.furniture} />
      <RecommendedMaterials items={design.materials} />
      <ModifyPanel
        key={design.id}
        design={design}
        onUpdated={(next) => {
          onDesignChange(next);
          router.replace(`/design/${next.id}`);
        }}
      />

      {history.length > 1 ? (
        <section aria-labelledby="history-heading">
          <h2 id="history-heading" className="font-serif text-2xl">
            Design history
          </h2>
          <ul className="mt-3 flex gap-3 overflow-x-auto pb-2">
            {history.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/design/${item.id}`}
                    aria-current={item.id === design.id ? "page" : undefined}
                    className={`block w-44 rounded-xl border p-3 text-left text-sm ${
                    item.id === design.id
                      ? "border-ink bg-ink text-paper"
                      : "border-line bg-card hover:border-ink/30"
                  }`}
                >
                  <p className="font-medium">{item.title}</p>
                  <p className="mt-1 text-xs opacity-70">
                    {formatInr(item.budget.totalEstimateInr)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
