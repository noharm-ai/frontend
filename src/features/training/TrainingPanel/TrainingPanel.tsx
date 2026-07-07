import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { Button, Progress } from "antd";
import { CheckCircleFilled } from "@ant-design/icons";

import { getTraining } from "../trainings";
import { localize } from "../types";
import { advanceStep, stopTraining } from "../TrainingSlice";
import { TRAINING_COLOR } from "../TrainingController/TrainingController.style";
import { Panel } from "./TrainingPanel.style";

export function TrainingPanel() {
  const dispatch = useDispatch<any>();
  const { t } = useTranslation();
  const status = useSelector((state: any) => state.training.status);
  const trainingId = useSelector((state: any) => state.training.trainingId);
  const stepIndex = useSelector((state: any) => state.training.stepIndex);
  const stepJustCompleted = useSelector(
    (state: any) => state.training.stepJustCompleted,
  );

  const training = getTraining(trainingId);
  if (!training) {
    return null;
  }

  if (status === "completed") {
    return (
      <Panel>
        <div className="panel-header">{localize(training.title)}</div>
        <div className="panel-body completed">
          <CheckCircleFilled />
          <h4>{t("training.completedTitle")}</h4>
          <p>{t("training.completedMessage")}</p>
        </div>
        <div className="panel-footer">
          <Button type="primary" onClick={() => dispatch(stopTraining())}>
            {t("training.finish")}
          </Button>
        </div>
      </Panel>
    );
  }

  const total = training.steps.length;
  const step = training.steps[stepIndex];
  const isTask = !!step.completeOn;
  const showNext = !stepJustCompleted && (!isTask || step.allowSkip);

  return (
    <Panel>
      <div className="panel-header">
        <span>{localize(training.title)}</span>
        <span className="step-counter">
          {t("training.stepCounter", { current: stepIndex + 1, total })}
        </span>
      </div>
      <Progress
        percent={((stepIndex + (stepJustCompleted ? 1 : 0)) / total) * 100}
        showInfo={false}
        strokeColor={TRAINING_COLOR}
        size={{ height: 4 }}
        style={{ display: "block", lineHeight: 0 }}
      />
      <motion.div
        key={step.id}
        initial={{ opacity: 0, transform: "translate3d(10px, 0, 0)" }}
        animate={{ opacity: 1, transform: "translate3d(0, 0, 0)" }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="panel-body">
          <h4>{localize(step.title)}</h4>
          <p>{localize(step.instruction)}</p>
          {step.hint && <p className="hint">{localize(step.hint)}</p>}
          {stepJustCompleted && (
            <div className="step-done">
              <CheckCircleFilled /> {t("training.stepDone")}
            </div>
          )}
        </div>
      </motion.div>
      <div className="panel-footer">
        <Button size="small" onClick={() => dispatch(stopTraining())}>
          {t("training.exit")}
        </Button>
        {showNext && (
          <Button
            size="small"
            type="primary"
            onClick={() => dispatch(advanceStep())}
          >
            {t("training.next")}
          </Button>
        )}
      </div>
    </Panel>
  );
}
