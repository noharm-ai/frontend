import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Tour } from "antd";

import { onTrainingEvent } from "../eventBus";
import { getTraining } from "../trainings";
import {
  advanceStep,
  stepCompleted,
  trainingTrackerEvent,
} from "../TrainingSlice";
import { localize } from "../types";
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
  const tourStops = step?.completeOn?.type === "tour" ? step.tour : undefined;

  // restart at the first stop whenever a new tour step becomes active
  // (adjusting state during render instead of an effect, per React docs)
  const [tourCurrent, setTourCurrent] = useState(0);
  const [tourStepId, setTourStepId] = useState(step?.id);
  if (step?.id !== tourStepId) {
    setTourStepId(step?.id);
    setTourCurrent(0);
  }

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
      {tourStops && !stepJustCompleted && (
        <Tour
          open
          current={tourCurrent}
          onChange={setTourCurrent}
          closeIcon={false}
          onClose={() => dispatch(stepCompleted())}
          steps={tourStops.map((stop) => ({
            title: localize(stop.title),
            description: stop.description
              ? localize(stop.description)
              : undefined,
            target: () => document.querySelector(stop.target) as HTMLElement,
          }))}
        />
      )}
      <TrainingPanel />
    </>
  );
}
