import { describe, expect, it } from "vitest";
import { applyModification, composeDesign } from "@/lib/ai/design-engine";
import type { RoomBrief } from "@/lib/api/types";

const brief: RoomBrief = {
  roomType: "LIVING_ROOM",
  lengthFt: 16,
  widthFt: 12,
  budgetInr: 250000,
  style: "MODERN",
  colourPreference: "Warm beige",
};

describe("design engine", () => {
  it("keeps photo insights empty without an upload", () => {
    expect(composeDesign(brief).photoInsights).toEqual([]);
  });

  it("records photo insights when a room image is provided", () => {
    const design = composeDesign({ ...brief, imageFileName: "living.jpg" });
    expect(design.photoInsights?.length).toBeGreaterThan(0);
    expect(design.photoInsights?.[0]?.detail).toMatch(/living\.jpg/);
  });

  it("applies a minimal style and ₹1.5 lakh budget from an instruction", () => {
    const current = composeDesign(brief);
    const next = applyModification(
      current,
      "Make it more minimal and reduce the budget to ₹1.5 lakh.",
    );
    expect(next.brief.style).toBe("MINIMAL");
    expect(next.brief.budgetInr).toBe(150000);
    expect(next.budget.totalEstimateInr).toBeLessThan(current.budget.totalEstimateInr);
  });
});
