import type { DesignRecommendation } from "@/lib/api/types";

const designs = new Map<string, DesignRecommendation>();

export const designStore = {
  save(design: DesignRecommendation): void {
    designs.set(design.id, design);
  },
  get(id: string): DesignRecommendation | undefined {
    return designs.get(id);
  },
  list(): DesignRecommendation[] {
    return [...designs.values()].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  },
};
