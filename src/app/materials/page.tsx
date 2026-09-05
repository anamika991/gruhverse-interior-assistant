import { MaterialCatalogue } from "@/components/materials/MaterialCatalogue";

export default function MaterialsPage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
      <p className="text-[11px] uppercase tracking-[0.26em] text-copper">
        Specification
      </p>
      <h1 className="mt-2 font-serif text-4xl">Materials</h1>
      <p className="mt-2 max-w-xl text-sm text-ink-soft">
        Plywood, MDF, laminate, hardware and sofa fabrics — indicative pricing for
        this prototype. Add items to the project basket.
      </p>
      <div className="mt-8">
        <MaterialCatalogue />
      </div>
    </main>
  );
}
