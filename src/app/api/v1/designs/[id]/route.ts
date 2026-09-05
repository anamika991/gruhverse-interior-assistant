import { designStore } from "@/data/design-store";
import { fail, ok } from "@/lib/api/http";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const design = designStore.get(id);
  if (!design) {
    return fail(404, "NOT_FOUND", "Design not found.");
  }
  return Response.json(ok(design, "Design fetched"));
}
