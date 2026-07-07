import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { onTrainingEvent } from "../eventBus";
import { getTraining } from "../trainings";
import { advanceStep, trainingTrackerEvent } from "../TrainingSlice";
import { TrainingBanner } from "../TrainingBanner/TrainingBanner";
import { TrainingPanel } from "../TrainingPanel/TrainingPanel";
import {
  TrainingFrame,
  TrainingHighlightStyle,
} from "./TrainingController.style";

/**
 * Single mount point for training mode (rendered by the Layout on every
 * page). Bridges tracker events into redux, highlights the active step's
 * target element and renders the banner/frame/panel while training is on.
 */
export function TrainingController() {
  const dispatch = useDispatch<any>();
  const status = useSelector((state: any) => state.training.status);
  const trainingId = useSelector((state: any) => state.training.trainingId);
  const stepIndex = useSelector((state: any) => state.training.stepIndex);
  const stepJustCompleted = useSelector(
    (state: any) => state.training.stepJustCompleted,
  );

  const training = getTraining(trainingId);
  const step = status === "active" ? training?.steps[stepIndex] : undefined;
  const target = step?.target;

  useEffect(() => {
    if (status !== "active") {
      return undefined;
    }
    return onTrainingEvent((event, details) => {
      dispatch(trainingTrackerEvent({ event, details }));
    });
  }, [status, dispatch]);

  // brief success flash before moving to the next step
  useEffect(() => {
    if (!stepJustCompleted) {
      return undefined;
    }
    const timer = setTimeout(() => dispatch(advanceStep()), 1200);
    return () => clearTimeout(timer);
  }, [stepJustCompleted, dispatch]);

  // note: the element must exist when the step activates; targets inside
  // re-rendered lists may lose the class until the next step change
  useEffect(() => {
    if (!target) {
      return undefined;
    }
    const element = document.querySelector(target);
    element?.classList.add("training-highlight");
    return () => element?.classList.remove("training-highlight");
  }, [target]);

  if (status === "idle" || !training) {
    return null;
  }

  return (
    <>
      <TrainingHighlightStyle />
      <TrainingBanner />
      <TrainingFrame aria-hidden="true" />
      <TrainingPanel />
    </>
  );
}
