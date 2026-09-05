import { describe, expect, it } from "vitest";
import { formatBudgetInput, formatInr, parseInrInput } from "@/lib/format";

describe("Indian rupee formatting", () => {
  it("groups lakhs as 2,50,000 and prefixes ₹", () => {
    expect(formatInr(250000).replace(/\s/g, "")).toBe("₹2,50,000");
  });

  it("formats the budget field while typing", () => {
    expect(formatBudgetInput("250000")).toBe("2,50,000");
    expect(formatBudgetInput("₹1,50,000")).toBe("1,50,000");
  });

  it("parses grouped and prefixed input", () => {
    expect(parseInrInput("₹2,50,000")).toBe(250000);
  });
});
