import type { BudgetBreakdown } from "@/lib/api/types";
import { formatInr } from "@/lib/format";

export function BudgetPanel({ budget }: { budget: BudgetBreakdown }) {
  const rows = [
    { label: "Furniture", value: budget.furnitureInr },
    { label: "Materials", value: budget.materialsInr },
    { label: "Labour", value: budget.labourInr },
    { label: "Contingency", value: budget.contingencyInr },
  ];

  return (
    <section
      aria-labelledby="budget-heading"
      className="rounded-2xl border border-line bg-ink p-5 text-paper"
    >
      <p className="text-[11px] uppercase tracking-[0.2em] text-paper/50">
        Approximate project budget
      </p>
      <h2 id="budget-heading" className="mt-1 font-serif text-4xl">
        {formatInr(budget.totalEstimateInr)}
      </h2>
      <ul className="mt-4 space-y-2 text-sm">
        {rows.map((row) => (
          <li key={row.label} className="flex justify-between text-paper/80">
            <span>{row.label}</span>
            <span className="tabular-nums">{formatInr(row.value)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
