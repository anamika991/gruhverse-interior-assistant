import { describe, expect, it } from "vitest";
import { formValuesToBrief, validateBriefForm } from "@/lib/validation/brief";

describe("validateBriefForm", () => {
  const valid = {
    roomType: "LIVING_ROOM",
    lengthFt: "16",
    widthFt: "12",
    budgetInr: "2,50,000",
    style: "MODERN",
    colourPreference: "Warm beige",
  };

  it("accepts a complete brief", () => {
    expect(validateBriefForm(valid)).toEqual({});
  });

  it("rejects a budget that is too low", () => {
    const errors = validateBriefForm({ ...valid, budgetInr: "10000" });
    expect(errors.budgetInr).toMatch(/at least/i);
  });

  it("rejects missing colour preference", () => {
    const errors = validateBriefForm({ ...valid, colourPreference: " " });
    expect(errors.colourPreference).toBeTruthy();
  });

  it("maps form values to a typed brief", () => {
    const brief = formValuesToBrief(valid, "room.jpg");
    expect(brief.lengthFt).toBe(16);
    expect(brief.budgetInr).toBe(250000);
    expect(brief.imageFileName).toBe("room.jpg");
  });
});
