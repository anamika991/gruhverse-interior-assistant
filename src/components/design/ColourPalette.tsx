import type { ColourSwatch } from "@/lib/api/types";

export function ColourPalette({ palette }: { palette: ColourSwatch[] }) {
  return (
    <section aria-labelledby="palette-heading">
      <h2 id="palette-heading" className="font-serif text-2xl">
        Colour palette
      </h2>
      <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {palette.map((swatch) => (
          <li
            key={swatch.hex}
            className="overflow-hidden rounded-xl border border-line bg-card"
          >
            <div className="h-16" style={{ background: swatch.hex }} />
            <div className="px-2.5 py-2">
              <p className="text-sm font-medium">{swatch.name}</p>
              <p className="text-[11px] uppercase tracking-wider text-ink-soft">
                {swatch.hex} · {swatch.role.toLowerCase()}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
