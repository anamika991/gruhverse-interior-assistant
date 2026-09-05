import { afterEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "@/lib/api/client";

describe("apiFetch", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns data from a success envelope", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({ data: { id: "dsn_1" }, message: "OK", timestamp: "t" }),
      }),
    );
    await expect(apiFetch<{ id: string }>("/designs")).resolves.toEqual({ id: "dsn_1" });
  });

  it("maps an error envelope to ApiError", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: async () =>
          JSON.stringify({
            error: { code: "VALIDATION_ERROR", message: "Invalid brief." },
            timestamp: "t",
          }),
      }),
    );
    await expect(apiFetch("/designs")).rejects.toMatchObject({
      name: "ApiError",
      code: "VALIDATION_ERROR",
      status: 400,
    });
  });

  it("maps a network failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    );
    await expect(apiFetch("/designs")).rejects.toMatchObject({
      code: "NETWORK_ERROR",
    });
  });
});
