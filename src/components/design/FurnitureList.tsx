import type { FurnitureRecommendation } from "@/lib/api/types";
import { formatInr } from "@/lib/format";

export function FurnitureList({ items }: { items: FurnitureRecommendation[] }) {
  return (
    <section aria-labelledby="furniture-heading">
      <h2 id="furniture-heading" className="font-serif text-2xl">
        Furniture
      </h2>
      <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-card">
        {items.map((item) => (
          <li key={item.id} className="flex items-start justify-between gap-4 px-4 py-3">
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="mt-0.5 text-sm text-ink-soft">{item.why}</p>
            </div>
            <p className="shrink-0 text-sm tabular-nums">{formatInr(item.estimatedPriceInr)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
