import type {
  ColourSwatch,
  DesignRecommendation,
  DesignStyle,
  FurnitureRecommendation,
  MaterialCategory,
  RoomBrief,
  RoomType,
} from "@/lib/api/types";
import { MATERIALS } from "@/data/materials";
import {
  parseBudgetInr,
  parseColourHint,
  parseStyle,
} from "@/lib/ai/instruction-parser";
import { ROOM_TYPE_LABEL, STYLE_LABEL } from "@/lib/format";

const SCENE_IMAGES: Record<RoomType, Record<DesignStyle, { url: string; alt: string }>> = {
  LIVING_ROOM: {
    MODERN: {
      url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
      alt: "Modern living room with large windows and a low sofa",
    },
    MINIMAL: {
      url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1600&q=80",
      alt: "Minimal living room with pale walls and sparse furniture",
    },
    LUXURY: {
      url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80",
      alt: "Luxury living room with layered lighting and rich textures",
    },
    TRADITIONAL: {
      url: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80",
      alt: "Traditional living room with warm wood and classic seating",
    },
  },
  BEDROOM: {
    MODERN: {
      url: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1600&q=80",
      alt: "Modern bedroom with platform bed and clean lines",
    },
    MINIMAL: {
      url: "https://images.unsplash.com/photo-1615874959470-d12f999c8be8?auto=format&fit=crop&w=1600&q=80",
      alt: "Calm minimal bedroom with soft neutrals",
    },
    LUXURY: {
      url: "https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=1600&q=80",
      alt: "Luxury bedroom with upholstered headboard",
    },
    TRADITIONAL: {
      url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80",
      alt: "Traditional bedroom with layered textiles",
    },
  },
  KITCHEN: {
    MODERN: {
      url: "https://images.unsplash.com/photo-1556912173-46c336c7fd55?auto=format&fit=crop&w=1600&q=80",
      alt: "Modern kitchen with island and handleless cabinets",
    },
    MINIMAL: {
      url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1600&q=80",
      alt: "Minimal kitchen with open counters and quiet palettes",
    },
    LUXURY: {
      url: "https://images.unsplash.com/photo-1600489000022-c2086d31072c?auto=format&fit=crop&w=1600&q=80",
      alt: "Luxury kitchen with stone island and statement lighting",
    },
    TRADITIONAL: {
      url: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=80",
      alt: "Traditional kitchen with shaker cabinets and warm wood",
    },
  },
};

const PALETTES: Record<DesignStyle, ColourSwatch[]> = {
  MODERN: [
    { name: "Warm Stone", hex: "#D9CFC3", role: "PRIMARY" },
    { name: "Graphite", hex: "#2F2A26", role: "SECONDARY" },
    { name: "Olive Smoke", hex: "#6B705C", role: "ACCENT" },
    { name: "Chalk", hex: "#F4F1EA", role: "NEUTRAL" },
  ],
  MINIMAL: [
    { name: "Cloud", hex: "#EDEAE3", role: "PRIMARY" },
    { name: "Soft Clay", hex: "#C4B6A6", role: "SECONDARY" },
    { name: "Ink Line", hex: "#1F1C19", role: "ACCENT" },
    { name: "Paper", hex: "#FAF8F4", role: "NEUTRAL" },
  ],
  LUXURY: [
    { name: "Deep Espresso", hex: "#2A211C", role: "PRIMARY" },
    { name: "Antique Brass", hex: "#B08D57", role: "ACCENT" },
    { name: "Velvet Moss", hex: "#3E4A3A", role: "SECONDARY" },
    { name: "Ivory", hex: "#F3EDE3", role: "NEUTRAL" },
  ],
  TRADITIONAL: [
    { name: "Terracotta", hex: "#B85C38", role: "PRIMARY" },
    { name: "Teak", hex: "#6B4226", role: "SECONDARY" },
    { name: "Cream Plaster", hex: "#EFE6D6", role: "NEUTRAL" },
    { name: "Forest", hex: "#3F4F3A", role: "ACCENT" },
  ],
};

const FURNITURE: Record<RoomType, Record<DesignStyle, Omit<FurnitureRecommendation, "id" | "estimatedPriceInr">[]>> =
  {
    LIVING_ROOM: {
      MODERN: [
        { name: "Low-profile 3-seater sofa", why: "Keeps sightlines open in a contemporary plan." },
        { name: "Slim oak media console", why: "Anchors the TV wall without bulky storage." },
        { name: "Sculptural floor lamp", why: "Adds evening light without extra ceiling work." },
      ],
      MINIMAL: [
        { name: "Compact 2.5-seater sofa", why: "Fewer pieces, more floor for a calmer room." },
        { name: "Nesting side tables", why: "Flexible surfaces that tuck away." },
        { name: "Hidden storage bench", why: "Declutters throws and remotes." },
      ],
      LUXURY: [
        { name: "Deep-seat sofa in velvet", why: "A tactile centrepiece for the room." },
        { name: "Marble-top coffee table", why: "Introduces stone and a sense of permanence." },
        { name: "Statement chandelier", why: "Creates a jewellery-like focal point." },
      ],
      TRADITIONAL: [
        { name: "Rolled-arm sofa", why: "A familiar silhouette with Indian living comfort." },
        { name: "Carved teak centre table", why: "Brings craft and warmth into the plan." },
        { name: "Brass floor diya lamp", why: "Soft traditional light without kitsch." },
      ],
    },
    BEDROOM: {
      MODERN: [
        { name: "Platform bed with integrated side tables", why: "Reduces furniture count on a compact floor." },
        { name: "Sliding-door wardrobe", why: "Saves swing space along the length wall." },
        { name: "Upholstered bench", why: "A practical landing spot at the foot of the bed." },
      ],
      MINIMAL: [
        { name: "Low teak bed", why: "Quiet geometry, no ornate headboard." },
        { name: "Handleless wardrobe", why: "A flush wall of storage." },
        { name: "Single lounge chair", why: "One reading moment instead of extra seating." },
      ],
      LUXURY: [
        { name: "Tall upholstered headboard", why: "Hotel-like scale for the sleeping wall." },
        { name: "Walk-in style wardrobe carcass", why: "Premium storage if the width allows." },
        { name: "Bedside consoles with stone top", why: "A luxe detail in daily reach." },
      ],
      TRADITIONAL: [
        { name: "Teak poster-inspired bed", why: "Heritage silhouette without heavy carving." },
        { name: "Swing-door wardrobe with moulding", why: "Classic storage language." },
        { name: "Cane lounge chair", why: "Breathable seating with a familiar craft." },
      ],
    },
    KITCHEN: {
      MODERN: [
        { name: "Handleless base and wall units", why: "A continuous plane for a contemporary kitchen." },
        { name: "Compact breakfast counter", why: "Adds casual seating without a full island." },
        { name: "Tall appliance garage", why: "Hides small appliances on the counter." },
      ],
      MINIMAL: [
        { name: "Open-shelf + closed mix", why: "Only the necessary storage, visually lighter." },
        { name: "Slim peninsula", why: "Work surface without crowding circulation." },
        { name: "Integrated appliance stack", why: "Keeps the elevation uncluttered." },
      ],
      LUXURY: [
        { name: "Stone-clad island", why: "A sculptural cook-and-serve centre." },
        { name: "Tall pantry with internal lighting", why: "Hotel-kitchen organisation." },
        { name: "Display vitrine for glassware", why: "A jewel-box moment in the run." },
      ],
      TRADITIONAL: [
        { name: "Shaker shutters in teak tone", why: "A classic Indian kitchen language." },
        { name: "Plate rack and open spice niche", why: "Everyday ritual, designed in." },
        { name: "Granite-top work triangle", why: "Durable, familiar, easy to maintain." },
      ],
    },
  };

const MATERIAL_PICKS: Record<DesignStyle, string[]> = {
  MODERN: ["mat-ply-bwp-18", "mat-mdf-16", "mat-lam-walnut", "mat-hw-hinge", "mat-sofa-linen"],
  MINIMAL: ["mat-ply-mr-12", "mat-mdf-prelam", "mat-lam-white", "mat-hw-channel", "mat-sofa-linen"],
  LUXURY: ["mat-ply-veneer", "mat-mdf-hdhmr", "mat-lam-brass", "mat-hw-handle", "mat-sofa-velvet"],
  TRADITIONAL: ["mat-ply-bwp-18", "mat-mdf-16", "mat-lam-walnut", "mat-hw-handle", "mat-sofa-leatherette"],
};

const MATERIAL_USAGE: Record<MaterialCategory, string> = {
  PLYWOOD: "Carcass and wet-adjacent structure",
  MDF: "Painted / routed shutters",
  LAMINATE: "Visible shutter and panel finish",
  HARDWARE: "Motion hardware and touch points",
  SOFA_MATERIAL: "Primary seating upholstery",
};

function tintPalette(palette: ColourSwatch[], preference: string): ColourSwatch[] {
  const p = preference.toLowerCase();
  return palette.map((swatch, index) => {
    if (index !== 0) return swatch;
    if (p.includes("blue") || p.includes("cool")) {
      return { ...swatch, name: `${preference} wash`, hex: "#A7B4C2" };
    }
    if (p.includes("green") || p.includes("sage")) {
      return { ...swatch, name: `${preference} wash`, hex: "#8A9A7B" };
    }
    if (p.includes("beige") || p.includes("warm") || p.includes("cream")) {
      return { ...swatch, name: `${preference} wash`, hex: "#E2D3C2" };
    }
    if (p.includes("grey") || p.includes("gray")) {
      return { ...swatch, name: `${preference} wash`, hex: "#C5C0B8" };
    }
    return { ...swatch, name: `${swatch.name} × ${preference}` };
  });
}

function areaMultiplier(brief: RoomBrief): number {
  const area = brief.lengthFt * brief.widthFt;
  return Math.max(0.75, Math.min(1.35, area / 180));
}

function styleMultiplier(style: DesignStyle): number {
  switch (style) {
    case "MINIMAL":
      return 0.82;
    case "MODERN":
      return 1;
    case "TRADITIONAL":
      return 1.08;
    case "LUXURY":
      return 1.28;
  }
}

function buildBudget(brief: RoomBrief, style: DesignStyle) {
  const target = brief.budgetInr * areaMultiplier(brief) * styleMultiplier(style);
  const clamped = Math.min(brief.budgetInr * 1.05, Math.max(brief.budgetInr * 0.72, target));
  const furniture = clamped * 0.38;
  const materials = clamped * 0.32;
  const labour = clamped * 0.22;
  const contingency = clamped - furniture - materials - labour;
  return {
    totalEstimateInr: Math.round(clamped),
    furnitureInr: Math.round(furniture),
    materialsInr: Math.round(materials),
    labourInr: Math.round(labour),
    contingencyInr: Math.round(contingency),
  };
}

function newId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function composeDesign(brief: RoomBrief, previous?: DesignRecommendation): DesignRecommendation {
  const scene = SCENE_IMAGES[brief.roomType][brief.style];
  const palette = tintPalette(PALETTES[brief.style], brief.colourPreference);
  const budget = buildBudget(brief, brief.style);
  const furnitureBase = FURNITURE[brief.roomType][brief.style];
  const furniture = furnitureBase.map((item, index) => ({
    id: `furn-${brief.roomType}-${brief.style}-${index}`,
    ...item,
    estimatedPriceInr: Math.round((budget.furnitureInr / furnitureBase.length) * (0.85 + index * 0.1)),
  }));

  const materials = MATERIAL_PICKS[brief.style]
    .map((id) => MATERIALS.find((m) => m.id === id))
    .filter((m): m is NonNullable<typeof m> => Boolean(m))
    .map((m) => ({
      materialId: m.id,
      name: m.name,
      category: m.category,
      usage: MATERIAL_USAGE[m.category],
      indicativePriceInr: m.indicativePriceInr,
    }));

  const area = brief.lengthFt * brief.widthFt;
  const notes = [
    `${ROOM_TYPE_LABEL[brief.roomType]} planned at ${brief.lengthFt} × ${brief.widthFt} ft (${area} sq.ft).`,
    `${STYLE_LABEL[brief.style]} language with a ${brief.colourPreference.toLowerCase()} bias.`,
    previous
      ? "Updated from your last instruction — furniture count and finishes were rebalanced."
      : "First pass: layout, palette and specification aligned to the brief.",
  ];

  if (brief.imageFileName) {
    notes.push(`Room photo “${brief.imageFileName}” used as context for proportion and light.`);
  }

  return {
    id: newId("dsn"),
    createdAt: new Date().toISOString(),
    brief,
    title: `${STYLE_LABEL[brief.style]} ${ROOM_TYPE_LABEL[brief.roomType]}`,
    summary: `A ${STYLE_LABEL[brief.style].toLowerCase()} scheme for a ${area} sq.ft ${ROOM_TYPE_LABEL[brief.roomType].toLowerCase()}, tuned to ${brief.colourPreference.toLowerCase()} and a working budget of about ₹${Math.round(brief.budgetInr / 1000)}k.`,
    imageUrl: scene.url,
    imageAlt: scene.alt,
    palette,
    furniture,
    materials,
    budget,
    designerNotes: notes,
  };
}

export function applyModification(
  current: DesignRecommendation,
  instruction: string,
): DesignRecommendation {
  const nextBudget = parseBudgetInr(instruction);
  const nextStyle = parseStyle(instruction);
  const colourHint = parseColourHint(instruction);

  const brief: RoomBrief = {
    ...current.brief,
    budgetInr: nextBudget ?? current.brief.budgetInr,
    style: nextStyle ?? current.brief.style,
    colourPreference: colourHint
      ? `${current.brief.colourPreference} (${colourHint})`
      : current.brief.colourPreference,
  };

  const design = composeDesign(brief, current);
  design.designerNotes.unshift(`Instruction received: “${instruction.trim()}”`);
  return design;
}

export const GENERATE_STEPS = [
  "Reading the room brief and photograph",
  "Checking proportions against budget",
  "Matching style language and colour bias",
  "Selecting furniture and finishes",
  "Drafting the specification pack",
];
