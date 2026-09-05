import { NextRequest } from "next/server";
import { MATERIALS } from "@/data/materials";
import { delay, ok } from "@/lib/api/http";
import { MATERIAL_CATEGORIES, type MaterialCategory } from "@/lib/api/types";

export async function GET(request: NextRequest) {
  await delay(220);
  const { searchParams } = request.nextUrl;
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  const category = searchParams.get("category");

  let items = MATERIALS;
  if (category && MATERIAL_CATEGORIES.includes(category as MaterialCategory)) {
    items = items.filter((m) => m.category === category);
  }
  if (q) {
    items = items.filter((m) =>
      `${m.name} ${m.brand} ${m.description}`.toLowerCase().includes(q),
    );
  }

  return Response.json(
    ok(
      {
        items,
        total: items.length,
      },
      items.length ? "Materials fetched" : "No materials matched",
    ),
  );
}
