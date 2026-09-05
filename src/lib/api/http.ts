import type { ApiErrorBody, ApiSuccess } from "@/lib/api/types";

export function ok<T>(data: T, message = "OK"): ApiSuccess<T> {
  return {
    data,
    message,
    timestamp: new Date().toISOString(),
  };
}

export function fail(
  status: number,
  code: string,
  message: string,
  details?: string[],
): Response {
  const body: ApiErrorBody = {
    error: { code, message, details },
    timestamp: new Date().toISOString(),
  };
  return Response.json(body, { status });
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
