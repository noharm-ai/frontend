import i18next from "i18next";

/**
 * Training content is authored inline in pt/en (see trainings/) so a whole
 * training lives in a single, type-checked file. UI chrome strings
 * ("Next", "Exit"...) use the regular i18next catalogs instead.
 */
export interface LocalizedText {
  pt: string;
  en: string;
}

/** Any redux action dispatched in the app (reduxsauce or RTK). */
export interface DispatchedAction {
  type: string;
  [key: string]: any;
}

/**
 * Declares when a training step is considered done:
 *
 * - "action": a redux action of the given type was dispatched. Use for flows
 *   that go through the store (thunk success actions, slice actions).
 * - "tracker": a tracked user action (utils/tracker.ts Tracked* enum value)
 *   was emitted. Use for interactions that only live in component state —
 *   the tracker enums are a stable catalog of "user did X" events.
 *
 * The optional `when` predicate refines the match (e.g. a specific payload).
 */
export type StepCompletion =
  | {
      type: "action";
      actionType: string;
      when?: (action: DispatchedAction, state: any) => boolean;
    }
  | {
      type: "tracker";
      event: string;
      when?: (details: Record<string, any>) => boolean;
    }
  | {
      /** Completed when the antd Tour rendered from `TrainingStep.tour` is finished. */
      type: "tour";
    };

/** One stop of a `TrainingStep.tour`, rendered as an antd Tour.Step. */
export interface TourStop {
  title: LocalizedText;
  description?: LocalizedText;
  /** CSS selector of the element this tour stop points at. */
  target: string;
}

export interface TrainingStep {
  id: string;
  title: LocalizedText;
  instruction: LocalizedText;
  hint?: LocalizedText;
  /** CSS selector of the element highlighted while this step is active. */
  target?: string;
  /**
   * Renders an antd Tour walking through several page elements. Requires
   * `completeOn: { type: "tour" }` — the step completes once the user
   * reaches the tour's last stop.
   */
  tour?: TourStop[];
  /**
   * Omit for informational steps: the panel shows a "Next" button instead of
   * waiting for a condition.
   */
  completeOn?: StepCompletion;
  /**
   * Also show the "Next" button when completeOn exists, letting the user
   * skip the task. Default false: the task must be performed to advance.
   */
  allowSkip?: boolean;
}

export interface Training {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  /** Route the app is navigated to before the training starts. */
  path: string;
  steps: TrainingStep[];
}

export const localize = (text: LocalizedText): string =>
  i18next.language === "en" ? text.en : text.pt;
