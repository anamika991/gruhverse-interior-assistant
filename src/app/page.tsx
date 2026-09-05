import { BriefForm } from "@/components/brief/BriefForm";

export default function HomePage() {
  return (
    <main className="mx-auto grid w-full max-w-6xl flex-1 gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-10 lg:py-8">
      <section className="max-w-xl lg:sticky lg:top-20 lg:pt-1">
        <p className="text-[11px] uppercase tracking-[0.26em] text-copper">
          AI interior design assistant
        </p>
        <h1 className="mt-2 font-serif text-4xl leading-tight sm:text-5xl">
          Brief a room. Receive a considered scheme.
        </h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-ink-soft">
          GruhVerse connects the brief — room, budget, style — to a specification
          you can refine. This prototype uses a mock REST API shaped like a future
          Spring Boot service.
        </p>
        <ul className="mt-6 space-y-2 text-sm text-ink-soft">
          <li>1. Describe the room and constraints</li>
          <li>2. Review palette, furniture and materials</li>
          <li>3. Ask for a change in plain language</li>
        </ul>
      </section>
      <section className="flex flex-col rounded-3xl border border-line bg-card/80 p-5 shadow-[0_20px_60px_-40px_rgba(28,25,22,0.6)] sm:p-6 lg:max-h-[calc(100dvh-5.75rem)]">
        <h2 className="shrink-0 font-serif text-2xl">Room brief</h2>
        <p className="mb-4 mt-1 shrink-0 text-sm text-ink-soft">
          All fields except the photograph are required.
        </p>
        <BriefForm />
      </section>
    </main>
  );
}
