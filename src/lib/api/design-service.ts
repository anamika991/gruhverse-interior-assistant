import { apiFetch, getApiBase } from "@/lib/api/client";
import { API_ROUTES } from "@/lib/api/contract";
import type {
  DesignRecommendation,
  RoomBrief,
  StreamEvent,
} from "@/lib/api/types";

export function generateDesign(brief: RoomBrief): Promise<DesignRecommendation> {
  return apiFetch<DesignRecommendation>(API_ROUTES.designs, {
    method: "POST",
    body: JSON.stringify(brief),
  });
}

export function fetchDesign(id: string): Promise<DesignRecommendation> {
  return apiFetch<DesignRecommendation>(API_ROUTES.design(id));
}

export function listDesigns(): Promise<DesignRecommendation[]> {
  return apiFetch<DesignRecommendation[]>(API_ROUTES.designs);
}

export function modifyDesign(
  id: string,
  instruction: string,
  currentDesign: DesignRecommendation,
): Promise<DesignRecommendation> {
  return apiFetch<DesignRecommendation>(API_ROUTES.modifications(id), {
    method: "POST",
    body: JSON.stringify({ instruction, currentDesign }),
  });
}

export async function streamDesign(
  payload: {
    brief?: RoomBrief;
    instruction?: string;
    currentDesign?: DesignRecommendation;
  },
  onEvent: (event: StreamEvent) => void,
  signal?: AbortSignal,
): Promise<DesignRecommendation> {
  const url = `${getApiBase()}${API_ROUTES.stream}`;
  const response = await fetch(url, {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok || !response.body) {
    throw new Error("Streaming design service is unavailable.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let completed: DesignRecommendation | undefined;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() ?? "";

    for (const chunk of chunks) {
      const line = chunk
        .split("\n")
        .find((l) => l.startsWith("data: "));
      if (!line) continue;
      const event = JSON.parse(line.slice(6)) as StreamEvent;
      onEvent(event);
      if (event.type === "complete") completed = event.design;
      if (event.type === "error") {
        throw new Error(event.message);
      }
    }
  }

  if (!completed) {
    throw new Error("The stream ended before a design was ready.");
  }
  return completed;
}
