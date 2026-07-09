import { useTranslation } from "react-i18next";
import {
  CheckOutlined,
  PlayCircleFilled,
  LockOutlined,
} from "@ant-design/icons";

import Button from "components/Button";

import { ITrainingModule } from "./TrainingCentralSlice";
import {
  ModuleRow,
  ModuleIconCircle,
  ModuleText,
  ModuleAction,
} from "./TrainingCentral.style";

type TrainingModuleStatus = "completed" | "current" | "locked";

interface TrainingModuleRowProps {
  module: ITrainingModule;
  status: TrainingModuleStatus;
  onContinue: () => void;
}

export function TrainingModuleRow({
  module,
  status,
  onContinue,
}: TrainingModuleRowProps) {
  const { t } = useTranslation();

  const icon = {
    completed: <CheckOutlined />,
    current: <PlayCircleFilled />,
    locked: <LockOutlined />,
  }[status];

  return (
    <ModuleRow $current={status === "current"}>
      <ModuleIconCircle $status={status}>{icon}</ModuleIconCircle>

      <ModuleText>
        <strong>
          {module.position} · {module.title}
          {module.mandatory && (
            <span className="mandatory-tag">
              {t("trainingCentral.mandatoryTag")}
            </span>
          )}
        </strong>
        <span>{module.description}</span>
      </ModuleText>

      {status === "locked" ? (
        <ModuleAction $status={status}>
          {t("trainingCentral.locked")}
        </ModuleAction>
      ) : (
        <Button
          type={status === "current" ? "primary" : "default"}
          onClick={onContinue}
        >
          {status === "completed"
            ? t("trainingCentral.completed")
            : module.totalLessonsFinished === 0
              ? t("trainingCentral.start")
              : t("trainingCentral.continue")}
        </Button>
      )}
    </ModuleRow>
  );
}
