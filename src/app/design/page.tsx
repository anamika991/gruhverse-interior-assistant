"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { DesignSkeleton } from "@/components/ui/Skeleton";
import { useHasHydrated } from "@/lib/use-hydration";
import { useProjectStore } from "@/store/project-store";

export default function DesignIndexPage() {
  const router = useRouter();
  const current = useProjectStore((s) => s.currentDesign);
  const hydrated = useHasHydrated();

  useEffect(() => {
    if (hydrated && current) {
      router.replace(`/design/${current.id}`);
    }
  }, [hydrated, current, router]);

  if (!hydrated || current) {
    return (
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <DesignSkeleton />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-16 sm:px-6">
      <EmptyState
        title="Your latest scheme will appear here"
        body="Start with a room brief to generate the first recommendation."
        actionLabel="Write a brief"
        onAction={() => router.push("/")}
      />
    </main>
  );
}
