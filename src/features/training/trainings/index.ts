import type { Training } from "../types";
import { prioritizationBasics } from "./prioritizationBasics";

/**
 * To add a new training: create a module in this folder exporting a Training
 * (see types.ts for the schema and prioritizationBasics.ts for a complete
 * example) and register it here. Redux only stores the training id — content
 * is always resolved through this registry.
 */
export const trainingRegistry: Record<string, Training> = {
  [prioritizationBasics.id]: prioritizationBasics,
};

export const getTraining = (
  id: string | null | undefined,
): Training | undefined => (id ? trainingRegistry[id] : undefined);
