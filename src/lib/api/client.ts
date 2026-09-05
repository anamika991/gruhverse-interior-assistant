export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: string[];

  constructor(status: number, code: string, message: string, details?: string[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/v1";

export function getApiBase(): string {
  return API_BASE.replace(/\/$/, "");
}

async function parseJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    throw new ApiError(response.status, "INVALID_RESPONSE", "The API returned non-JSON data.");
  }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const url = `${getApiBase()}${path.startsWith("/") ? path : `/${path}`}`;
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...init?.headers,
      },
    });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "Could not reach the design service.");
  }

  const payload = (await parseJson(response)) as {
    data?: T;
    error?: { code: string; message: string; details?: string[] };
  };

  if (!response.ok) {
    throw new ApiError(
      response.status,
      payload?.error?.code ?? "HTTP_ERROR",
      payload?.error?.message ?? "Something went wrong.",
      payload?.error?.details,
    );
  }

  if (payload?.data === undefined) {
    throw new ApiError(response.status, "EMPTY_BODY", "The API returned no data.");
  }

  return payload.data;
}
