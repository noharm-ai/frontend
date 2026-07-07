import { getTraining } from "./trainings";
import { stepCompleted, trainingTrackerEvent } from "./TrainingSlice";
import type { DispatchedAction, StepCompletion } from "./types";

/**
 * Single evaluation point for step completion: every redux action (including
 * trainingTrackerEvent, which bridges utils/tracker.ts events) is matched
 * against the active step's completeOn condition. stepJustCompleted gates
 * re-entry so a step cannot complete twice while the success flash plays.
 */
export const trainingMiddleware =
  (store: any) => (next: any) => (dispatchedAction: unknown) => {
    const result = next(dispatchedAction);
    const action = dispatchedAction as DispatchedAction;

    const training = store.getState().training;
    if (
      !training ||
      training.status !== "active" ||
      training.stepJustCompleted
    ) {
      return result;
    }

    const step = getTraining(training.trainingId)?.steps[training.stepIndex];
    const condition: StepCompletion | undefined = step?.completeOn;
    if (!condition) {
      return result;
    }

    let done = false;
    if (condition.type === "action" && action.type === condition.actionType) {
      done = !condition.when || condition.when(action, store.getState());
    } else if (
      condition.type === "tracker" &&
      action.type === trainingTrackerEvent.type
    ) {
      const { event, details } = action.payload ?? {};
      done =
        event === condition.event &&
        (!condition.when || condition.when(details ?? {}));
    }

    if (done) {
      store.dispatch(stepCompleted());
    }

    return result;
  };
