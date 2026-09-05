"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  DesignRecommendation,
  ProjectMaterial,
} from "@/lib/api/types";

interface ProjectState {
  currentDesign: DesignRecommendation | null;
  history: DesignRecommendation[];
  projectMaterials: ProjectMaterial[];
  setCurrentDesign: (design: DesignRecommendation) => void;
  addToProject: (item: ProjectMaterial) => void;
  removeFromProject: (materialId: string) => void;
  clearProject: () => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      currentDesign: null,
      history: [],
      projectMaterials: [],
      setCurrentDesign: (design) => {
        const history = [design, ...get().history.filter((d) => d.id !== design.id)].slice(
          0,
          8,
        );
        set({ currentDesign: design, history });
      },
      addToProject: (item) => {
        const existing = get().projectMaterials.find((m) => m.materialId === item.materialId);
        if (existing) {
          set({
            projectMaterials: get().projectMaterials.map((m) =>
              m.materialId === item.materialId
                ? { ...m, quantity: m.quantity + item.quantity }
                : m,
            ),
          });
          return;
        }
        set({ projectMaterials: [...get().projectMaterials, item] });
      },
      removeFromProject: (materialId) => {
        set({
          projectMaterials: get().projectMaterials.filter((m) => m.materialId !== materialId),
        });
      },
      clearProject: () => set({ projectMaterials: [] }),
    }),
    { name: "gruhverse-project", version: 1 },
  ),
);
