"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DesignResult } from "@/components/design/DesignResult";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { DesignSkeleton } from "@/components/ui/Skeleton";
import { fetchDesign } from "@/lib/api/design-service";
import type { DesignRecommendation } from "@/lib/api/types";
import { useHasHydrated } from "@/lib/use-hydration";
import { useProjectStore } from "@/store/project-store";

type Remote =
  | { id: string; status: "success"; design: DesignRecommendation }
  | { id: string; status: "empty" }
  | { id: string; status: "error"; message: string };

export default function DesignDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const storeDesign = useProjectStore((s) => s.currentDesign);
  const history = useProjectStore((s) => s.history);
  const hydrated = useHasHydrated();
  const [remote, setRemote] = useState<Remote | null>(null);
  const [retry, setRetry] = useState(0);
  const [override, setOverride] = useState<DesignRecommendation | null>(null);

  const fromStore =
    hydrated
      ? (history.find((d) => d.id === params.id) ??
        (storeDesign?.id === params.id ? storeDesign : null))
      : null;

  useEffect(() => {
    if (!hydrated || fromStore) return;
    const id = params.id;
    let cancelled = false;
    fetchDesign(id)
      .then((data) => {
        if (!cancelled) setRemote({ id, status: "success", design: data });
      })
      .catch((err) => {
        if (cancelled) return;
        if (err && typeof err === "object" && "status" in err && err.status === 404) {
          setRemote({ id, status: "empty" });
          return;
        }
        setRemote({
          id,
          status: "error",
          message: err instanceof Error ? err.message : "Could not load this design.",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [hydrated, fromStore, params.id, retry]);

  const design = override?.id === params.id ? override : fromStore ?? (remote?.status === "success" && remote.id === params.id ? remote.design : null);
  const remoteForId = remote?.id === params.id ? remote : null;
  const status = !hydrated
    ? "loading"
    : design
      ? "success"
      : !fromStore && !remoteForId
        ? "loading"
        : remoteForId?.status === "empty"
          ? "empty"
          : remoteForId?.status === "error"
            ? "error"
            : "loading";

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
      {status === "loading" ? <DesignSkeleton /> : null}
      {status === "error" && remoteForId?.status === "error" ? (
        <ErrorState body={remoteForId.message} onRetry={() => setRetry((n) => n + 1)} />
      ) : null}
      {status === "empty" ? (
        <EmptyState
          title="No design yet"
          body="Generate a scheme from the brief, or pick one from your recent history."
          actionLabel="Write a brief"
          onAction={() => router.push("/")}
        />
      ) : null}
      {status === "success" && design ? (
        <DesignResult design={design} onDesignChange={setOverride} />
      ) : null}
    </main>
  );
}
