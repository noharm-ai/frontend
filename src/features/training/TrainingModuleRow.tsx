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
        </strong>
        <span>{module.description}</span>
      </ModuleText>

      {status === "current" ? (
        <Button type="primary" onClick={onContinue}>
          {t("trainingCentral.continue")}
        </Button>
      ) : (
        <ModuleAction $status={status}>
          {status === "completed"
            ? t("trainingCentral.completed")
            : t("trainingCentral.locked")}
        </ModuleAction>
      )}
    </ModuleRow>
  );
}
