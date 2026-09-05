import { describe, expect, it } from "vitest";
import { parseBudgetInr, parseStyle } from "@/lib/ai/instruction-parser";

describe("instruction parser", () => {
  it("reads an Indian lakh budget", () => {
    expect(
      parseBudgetInr("Make it more minimal and reduce the budget to ₹1.5 lakh."),
    ).toBe(150000);
  });

  it("reads a style keyword", () => {
    expect(parseStyle("Make it more minimal please")).toBe("MINIMAL");
    expect(parseStyle("shift towards luxury")).toBe("LUXURY");
  });

  it("returns undefined when nothing is specified", () => {
    expect(parseBudgetInr("just warmer lighting")).toBeUndefined();
  });
});
