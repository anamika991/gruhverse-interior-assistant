export const ROOM_TYPES = ["LIVING_ROOM", "BEDROOM", "KITCHEN"] as const;
export type RoomType = (typeof ROOM_TYPES)[number];

export const DESIGN_STYLES = [
  "MODERN",
  "MINIMAL",
  "LUXURY",
  "TRADITIONAL",
] as const;
export type DesignStyle = (typeof DESIGN_STYLES)[number];

export const MATERIAL_CATEGORIES = [
  "PLYWOOD",
  "MDF",
  "LAMINATE",
  "HARDWARE",
  "SOFA_MATERIAL",
] as const;
export type MaterialCategory = (typeof MATERIAL_CATEGORIES)[number];

export const AVAILABILITY = ["IN_STOCK", "LIMITED", "MADE_TO_ORDER"] as const;
export type Availability = (typeof AVAILABILITY)[number];

export interface RoomBrief {
  roomType: RoomType;
  lengthFt: number;
  widthFt: number;
  budgetInr: number;
  style: DesignStyle;
  colourPreference: string;
  imageFileName?: string;
}

export interface ColourSwatch {
  name: string;
  hex: string;
  role: "PRIMARY" | "SECONDARY" | "ACCENT" | "NEUTRAL";
}

export interface FurnitureRecommendation {
  id: string;
  name: string;
  why: string;
  estimatedPriceInr: number;
}

export interface MaterialRecommendation {
  materialId: string;
  name: string;
  category: MaterialCategory;
  usage: string;
  indicativePriceInr: number;
}

export interface BudgetBreakdown {
  totalEstimateInr: number;
  furnitureInr: number;
  materialsInr: number;
  labourInr: number;
  contingencyInr: number;
}

export interface DesignRecommendation {
  id: string;
  createdAt: string;
  brief: RoomBrief;
  title: string;
  summary: string;
  imageUrl: string;
  imageAlt: string;
  palette: ColourSwatch[];
  furniture: FurnitureRecommendation[];
  materials: MaterialRecommendation[];
  budget: BudgetBreakdown;
  designerNotes: string[];
}

export interface DesignModificationRequest {
  instruction: string;
  currentDesignId: string;
}

export interface Material {
  id: string;
  name: string;
  category: MaterialCategory;
  description: string;
  imageUrl: string;
  indicativePriceInr: number;
  unit: string;
  availability: Availability;
  brand: string;
}

export interface ProjectMaterial {
  materialId: string;
  name: string;
  category: MaterialCategory;
  indicativePriceInr: number;
  unit: string;
  quantity: number;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: string[];
  };
  timestamp: string;
}

export interface ApiSuccess<T> {
  data: T;
  message: string;
  timestamp: string;
}

export type StreamEvent =
  | { type: "progress"; step: number; total: number; message: string }
  | { type: "complete"; design: DesignRecommendation }
  | { type: "error"; message: string };
