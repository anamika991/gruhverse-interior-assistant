import type { DesignStyle } from "@/lib/api/types";

const STYLE_PATTERNS: { style: DesignStyle; pattern: RegExp }[] = [
  { style: "MINIMAL", pattern: /\bminimal(?:ist)?\b/i },
  { style: "LUXURY", pattern: /\b(luxury|luxe|premium|opulent)\b/i },
  { style: "TRADITIONAL", pattern: /\b(traditional|classic|heritage|ethnic)\b/i },
  { style: "MODERN", pattern: /\b(modern|contemporary)\b/i },
];

/**
 * Parses a natural-language modification (e.g. "reduce the budget to ₹1.5 lakh")
 * so the mock service can behave like an AI backend.
 */
export function parseBudgetInr(instruction: string): number | undefined {
  const normalised = instruction.replace(/,/g, "").toLowerCase();

  const lakh = normalised.match(
    /(?:₹|rs\.?\s*)?(\d+(?:\.\d+)?)\s*(?:lakh|lac|l)\b/,
  );
  if (lakh) {
    return Math.round(Number(lakh[1]) * 100_000);
  }

  const crore = normalised.match(/(?:₹|rs\.?\s*)?(\d+(?:\.\d+)?)\s*(?:cr|crore)\b/);
  if (crore) {
    return Math.round(Number(crore[1]) * 10_000_000);
  }

  const rupees = normalised.match(/₹\s*(\d{5,})/);
  if (rupees) {
    return Number(rupees[1]);
  }

  const plain = normalised.match(
    /(?:budget|cost|spend).*?(?:to|of|:)\s*(?:₹|rs\.?\s*)?(\d{5,})/,
  );
  if (plain) {
    return Number(plain[1]);
  }

  return undefined;
}

export function parseStyle(instruction: string): DesignStyle | undefined {
  for (const { style, pattern } of STYLE_PATTERNS) {
    if (pattern.test(instruction)) return style;
  }
  return undefined;
}

export function parseColourHint(instruction: string): string | undefined {
  const match = instruction.match(
    /\b(warmer|cooler|brighter|darker|earth(?:y|en)?|neutral|pastel|monochrome)\b/i,
  );
  return match?.[1];
}
