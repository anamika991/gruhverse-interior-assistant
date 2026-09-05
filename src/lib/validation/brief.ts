import {
  DESIGN_STYLES,
  ROOM_TYPES,
  type DesignStyle,
  type RoomBrief,
  type RoomType,
} from "@/lib/api/types";
import { parseInrInput } from "@/lib/format";

export type BriefFormValues = {
  roomType: string;
  lengthFt: string;
  widthFt: string;
  budgetInr: string;
  style: string;
  colourPreference: string;
};

export type BriefFieldErrors = Partial<Record<keyof BriefFormValues, string>>;

const MIN_BUDGET = 50_000;
const MAX_BUDGET = 50_00_000;
const MIN_DIM = 4;
const MAX_DIM = 80;

export function validateBriefForm(values: BriefFormValues): BriefFieldErrors {
  const errors: BriefFieldErrors = {};

  if (!ROOM_TYPES.includes(values.roomType as RoomType)) {
    errors.roomType = "Choose a room type.";
  }

  const length = Number(values.lengthFt);
  if (!values.lengthFt.trim() || Number.isNaN(length)) {
    errors.lengthFt = "Enter the room length.";
  } else if (length < MIN_DIM || length > MAX_DIM) {
    errors.lengthFt = `Length must be between ${MIN_DIM} and ${MAX_DIM} ft.`;
  }

  const width = Number(values.widthFt);
  if (!values.widthFt.trim() || Number.isNaN(width)) {
    errors.widthFt = "Enter the room width.";
  } else if (width < MIN_DIM || width > MAX_DIM) {
    errors.widthFt = `Width must be between ${MIN_DIM} and ${MAX_DIM} ft.`;
  }

  const budget = parseInrInput(values.budgetInr);
  if (!values.budgetInr.trim() || Number.isNaN(budget)) {
    errors.budgetInr = "Enter a project budget.";
  } else if (budget < MIN_BUDGET) {
    errors.budgetInr = `Budget should be at least ${MIN_BUDGET.toLocaleString("en-IN")}.`;
  } else if (budget > MAX_BUDGET) {
    errors.budgetInr = "Enter a realistic residential budget.";
  }

  if (!DESIGN_STYLES.includes(values.style as DesignStyle)) {
    errors.style = "Choose a design style.";
  }

  if (!values.colourPreference.trim()) {
    errors.colourPreference = "Share a colour preference.";
  } else if (values.colourPreference.trim().length < 2) {
    errors.colourPreference = "Add a little more detail (e.g. warm beige).";
  }

  return errors;
}

export function formValuesToBrief(
  values: BriefFormValues,
  imageFileName?: string,
): RoomBrief {
  return {
    roomType: values.roomType as RoomType,
    lengthFt: Number(values.lengthFt),
    widthFt: Number(values.widthFt),
    budgetInr: parseInrInput(values.budgetInr),
    style: values.style as DesignStyle,
    colourPreference: values.colourPreference.trim(),
    imageFileName,
  };
}

export function validateImageFile(file: File | null): string | undefined {
  if (!file) return undefined;
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/heic"];
  if (!allowed.includes(file.type) && !file.name.match(/\.(jpe?g|png|webp|heic)$/i)) {
    return "Upload a JPG, PNG or WEBP image.";
  }
  const maxBytes = 5 * 1024 * 1024;
  if (file.size > maxBytes) {
    return "Keep the image under 5 MB.";
  }
  return undefined;
}
