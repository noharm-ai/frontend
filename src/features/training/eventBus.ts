export type TrainingEventListener = (
  event: string,
  details: Record<string, unknown>,
) => void;

const listeners = new Set<TrainingEventListener>();

/**
 * Called by utils/tracker.ts on every tracked user action so training step
 * conditions can react to interactions that never reach redux (sort order,
 * status filter, keyword search...). This module must stay dependency-free:
 * it sits between tracker.ts and the redux store and would otherwise create
 * an import cycle.
 */
export const emitTrainingEvent = (
  event: string,
  details: Record<string, unknown> = {},
): void => {
  listeners.forEach((listener) => listener(event, details));
};

export const onTrainingEvent = (
  listener: TrainingEventListener,
): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
