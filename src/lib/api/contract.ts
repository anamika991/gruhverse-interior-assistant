/**
 * REST contract consumed by the frontend.
 * A Java / Spring Boot service can implement the same paths and envelopes.
 */
export const API_ROUTES = {
  designs: "/designs",
  design: (id: string) => `/designs/${id}`,
  modifications: (id: string) => `/designs/${id}/modifications`,
  stream: "/designs/stream",
  materials: "/materials",
} as const;
