"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useIsClient } from "@/lib/use-hydration";
import { useProjectStore } from "@/store/project-store";

const links = [
  { href: "/", label: "Brief" },
  { href: "/design", label: "Result" },
  { href: "/materials", label: "Materials" },
];

export function AppHeader() {
  const pathname = usePathname();
  const count = useProjectStore((s) => s.projectMaterials.length);
  const mounted = useIsClient();

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="grid h-8 w-8 place-items-center rounded-sm bg-ink text-[11px] font-medium tracking-[0.18em] text-paper"
          >
            GV
          </span>
          <span className="leading-tight">
            <span className="block font-serif text-xl font-semibold tracking-tight">
              GruhVerse
            </span>
            <span className="block text-[11px] uppercase tracking-[0.22em] text-ink-soft">
              Interior studio
            </span>
          </span>
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-1 sm:gap-2">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href === "/design" ? "/design" : link.href}
                className={`rounded-full px-3 py-1.5 text-sm transition ${
                  active
                    ? "bg-ink text-paper"
                    : "text-ink-soft hover:bg-paper-2 hover:text-ink"
                }`}
              >
                {link.label}
                {link.href === "/materials" && mounted && count > 0 ? (
                  <span className="ml-1.5 text-[11px] opacity-80">({count})</span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
