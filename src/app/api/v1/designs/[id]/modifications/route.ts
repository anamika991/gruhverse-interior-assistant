import { NextRequest } from "next/server";
import { applyModification } from "@/lib/ai/design-engine";
import { designStore } from "@/data/design-store";
import { delay, fail, ok } from "@/lib/api/http";
import type { DesignRecommendation } from "@/lib/api/types";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  await delay(320);
  const { id } = await context.params;
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return fail(400, "INVALID_JSON", "Could not parse JSON body.");
  }

  const body = json as { instruction?: string; currentDesign?: DesignRecommendation };
  const instruction = body.instruction?.trim();
  if (!instruction || instruction.length < 8) {
    return fail(
      400,
      "VALIDATION_ERROR",
      "Describe the change in a little more detail.",
      ["instruction must be at least 8 characters"],
    );
  }

  const current = body.currentDesign ?? designStore.get(id);
  if (!current) {
    return fail(404, "NOT_FOUND", "Design not found. Send currentDesign or a known id.");
  }

  const next = applyModification(current, instruction);
  designStore.save(next);
  return Response.json(ok(next, "Design updated"), { status: 201 });
}
