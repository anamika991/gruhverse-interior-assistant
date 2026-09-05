import { apiFetch } from "@/lib/api/client";
import { API_ROUTES } from "@/lib/api/contract";
import type { Material, MaterialCategory } from "@/lib/api/types";

export interface MaterialListResponse {
  items: Material[];
  total: number;
}

export function fetchMaterials(params?: {
  q?: string;
  category?: MaterialCategory | "";
}): Promise<MaterialListResponse> {
  const search = new URLSearchParams();
  if (params?.q) search.set("q", params.q);
  if (params?.category) search.set("category", params.category);
  const suffix = search.toString() ? `?${search.toString()}` : "";
  return apiFetch<MaterialListResponse>(`${API_ROUTES.materials}${suffix}`);
}
