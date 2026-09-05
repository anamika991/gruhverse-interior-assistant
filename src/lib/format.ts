import type {
  Availability,
  DesignStyle,
  MaterialCategory,
  RoomType,
} from "@/lib/api/types";

export function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

export function parseInrInput(value: string): number {
  return Number(value.replace(/[₹,\s]/g, ""));
}

export function formatBudgetInput(raw: string): string {
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return "";
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    Number(digits),
  );
}

export const ROOM_TYPE_LABEL: Record<RoomType, string> = {
  LIVING_ROOM: "Living Room",
  BEDROOM: "Bedroom",
  KITCHEN: "Kitchen",
};

export const STYLE_LABEL: Record<DesignStyle, string> = {
  MODERN: "Modern",
  MINIMAL: "Minimal",
  LUXURY: "Luxury",
  TRADITIONAL: "Traditional",
};

export const CATEGORY_LABEL: Record<MaterialCategory, string> = {
  PLYWOOD: "Plywood",
  MDF: "MDF",
  LAMINATE: "Laminate / Sunmica",
  HARDWARE: "Hardware",
  SOFA_MATERIAL: "Sofa material",
};

export const AVAILABILITY_LABEL: Record<Availability, string> = {
  IN_STOCK: "In stock",
  LIMITED: "Limited",
  MADE_TO_ORDER: "Made to order",
};
