import { NextRequest } from "next/server";
import { composeDesign } from "@/lib/ai/design-engine";
import { designStore } from "@/data/design-store";
import { delay, fail, ok } from "@/lib/api/http";
import { DESIGN_STYLES, ROOM_TYPES, type RoomBrief } from "@/lib/api/types";

function parseBrief(input: unknown): { brief?: RoomBrief; errors: string[] } {
  if (!input || typeof input !== "object") {
    return { errors: ["Request body must be a JSON object."] };
  }
  const body = input as Record<string, unknown>;
  const errors: string[] = [];

  if (!ROOM_TYPES.includes(body.roomType as RoomBrief["roomType"])) {
    errors.push("roomType is required and must be a supported room.");
  }
  if (typeof body.lengthFt !== "number" || body.lengthFt <= 0) {
    errors.push("lengthFt must be a positive number.");
  }
  if (typeof body.widthFt !== "number" || body.widthFt <= 0) {
    errors.push("widthFt must be a positive number.");
  }
  if (typeof body.budgetInr !== "number" || body.budgetInr < 50_000) {
    errors.push("budgetInr must be at least 50000.");
  }
  if (!DESIGN_STYLES.includes(body.style as RoomBrief["style"])) {
    errors.push("style is required and must be a supported style.");
  }
  if (typeof body.colourPreference !== "string" || !body.colourPreference.trim()) {
    errors.push("colourPreference is required.");
  }

  if (errors.length) return { errors };

  return {
    brief: {
      roomType: body.roomType as RoomBrief["roomType"],
      lengthFt: body.lengthFt as number,
      widthFt: body.widthFt as number,
      budgetInr: body.budgetInr as number,
      style: body.style as RoomBrief["style"],
      colourPreference: (body.colourPreference as string).trim(),
      imageFileName:
        typeof body.imageFileName === "string" ? body.imageFileName : undefined,
    },
    errors: [],
  };
}

export async function POST(request: NextRequest) {
  await delay(280);
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return fail(400, "INVALID_JSON", "Could not parse JSON body.");
  }

  const { brief, errors } = parseBrief(json);
  if (!brief) {
    return fail(400, "VALIDATION_ERROR", "Invalid design brief.", errors);
  }

  const design = composeDesign(brief);
  designStore.save(design);
  return Response.json(ok(design, "Design generated"), { status: 201 });
}

export async function GET() {
  await delay(180);
  return Response.json(ok(designStore.list(), "Design history"));
}
