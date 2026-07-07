import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { ExperimentOutlined } from "@ant-design/icons";

import Button from "components/Button";
import Tooltip from "components/Tooltip";
import FeaturesService from "services/features";
import { getTraining } from "../trainings";
import { startTraining } from "../TrainingSlice";

interface TrainingTriggerProps {
  trainingId: string;
}

/**
 * Entry point for a training, gated by the TRAINING_MODE feature flag.
 * Drop it on any page and point it at a registered training id.
 */
export function TrainingTrigger({ trainingId }: TrainingTriggerProps) {
  const dispatch = useDispatch<any>();
  const { t } = useTranslation();
  const features = useSelector((state: any) => state.user.account.features);
  const status = useSelector((state: any) => state.training.status);

  if (!FeaturesService(features).hasTrainingMode()) {
    return null;
  }

  if (status !== "idle" || !getTraining(trainingId)) {
    return null;
  }

  return (
    <Tooltip title={t("training.startTooltip")}>
      <Button
        icon={<ExperimentOutlined />}
        onClick={() => dispatch(startTraining(trainingId))}
      >
        {t("training.start")}
      </Button>
    </Tooltip>
  );
}
