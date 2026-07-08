import type { ModuleStatus } from "./types";

/**
 * Stand-in for a future GET /training/status endpoint. Until that exists,
 * every user starts fresh: no module completed, the first one unlocked and
 * everything after it locked. Replace this with the real fetch once the
 * backend ships — callers already treat the result as if it came from one.
 */
const MOCK_COMPLETED_TRAINING_IDS: string[] = [];

export const getTrainingStatuses = (
  trainingIds: string[],
): Record<string, ModuleStatus> => {
  const statuses: Record<string, ModuleStatus> = {};
  let nextIsUnlocked = true;

  trainingIds.forEach((id) => {
    if (MOCK_COMPLETED_TRAINING_IDS.includes(id)) {
      statuses[id] = "completed";
      return;
    }
    statuses[id] = nextIsUnlocked ? "active" : "locked";
    nextIsUnlocked = false;
  });

  return statuses;
};
