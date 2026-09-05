import { NextRequest } from "next/server";
import { applyModification, composeDesign, GENERATE_STEPS } from "@/lib/ai/design-engine";
import { designStore } from "@/data/design-store";
import { delay, fail } from "@/lib/api/http";
import { DESIGN_STYLES, ROOM_TYPES, type DesignRecommendation, type RoomBrief } from "@/lib/api/types";

function isBrief(value: unknown): value is RoomBrief {
  if (!value || typeof value !== "object") return false;
  const b = value as RoomBrief;
  return (
    ROOM_TYPES.includes(b.roomType) &&
    DESIGN_STYLES.includes(b.style) &&
    typeof b.lengthFt === "number" &&
    typeof b.widthFt === "number" &&
    typeof b.budgetInr === "number" &&
    typeof b.colourPreference === "string"
  );
}

export async function POST(request: NextRequest) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return fail(400, "INVALID_JSON", "Could not parse JSON body.");
  }

  const body = json as {
    brief?: unknown;
    instruction?: string;
    currentDesign?: DesignRecommendation;
  };

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (payload: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      };

      try {
        for (let i = 0; i < GENERATE_STEPS.length; i += 1) {
          send({
            type: "progress",
            step: i + 1,
            total: GENERATE_STEPS.length,
            message: GENERATE_STEPS[i],
          });
          await delay(420);
        }

        let design: DesignRecommendation;
        if (body.instruction && body.currentDesign) {
          design = applyModification(body.currentDesign, body.instruction);
        } else if (isBrief(body.brief)) {
          design = composeDesign(body.brief);
        } else {
          send({ type: "error", message: "Provide a brief or a modification payload." });
          controller.close();
          return;
        }

        designStore.save(design);
        send({ type: "complete", design });
      } catch {
        send({ type: "error", message: "The design service failed. Please retry." });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
