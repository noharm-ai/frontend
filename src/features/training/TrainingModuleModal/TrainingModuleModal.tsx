import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
import { Button, Progress } from "antd";
import {
  CaretRightOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  LockOutlined,
} from "@ant-design/icons";

import Modal from "components/Modal";
import { trainingRegistry } from "../trainings";
import { getTrainingStatuses } from "../trainingStatus";
import { localize, type ModuleStatus } from "../types";
import { startTraining } from "../TrainingSlice";
import {
  CertificateHint,
  Header,
  ModuleItem,
  ModuleList,
  ProgressSummary,
} from "./TrainingModuleModal.style";

interface TrainingModuleModalProps {
  open: boolean;
  onClose: () => void;
}

const statusIcon = (status: ModuleStatus) => {
  if (status === "completed") return <CheckOutlined />;
  if (status === "active") return <CaretRightOutlined />;
  return <LockOutlined />;
};

/**
 * Entry point for training mode: shows overall progress and lets the user
 * pick which module to start. New trainings only need to be registered in
 * trainings/index.ts to show up here.
 */
export function TrainingModuleModal({
  open,
  onClose,
}: TrainingModuleModalProps) {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const trainings = Object.values(trainingRegistry);
  const statuses = getTrainingStatuses(trainings.map((training) => training.id));
  const total = trainings.length;
  const completed = trainings.filter(
    (training) => statuses[training.id] === "completed",
  ).length;
  const percent = total ? Math.round((completed / total) * 100) : 0;

  const startModule = (trainingId: string, path: string) => {
    onClose();
    navigate(path);
    dispatch(startTraining(trainingId));
  };

  return (
    <Modal open={open} onCancel={onClose} footer={null} width={640}>
      <Header>
        <div>
          <h2>{t("training.selectModuleTitle")}</h2>
          <p>{t("training.selectModuleDescription")}</p>
        </div>
        <ProgressSummary>
          <Progress type="circle" percent={percent} size={64} />
          <div className="count">
            {t("training.progressSummary", { completed, total })}
            <br />
            {t("training.progressSummaryDetail")}
          </div>
        </ProgressSummary>
      </Header>

      <ModuleList>
        {trainings.map((training, index) => {
          const status = statuses[training.id];
          return (
            <ModuleItem key={training.id} $status={status}>
              <div className="badge">{statusIcon(status)}</div>
              <div className="content">
                <p className="title">
                  {index + 1} · {localize(training.title)}
                </p>
                <p className="description">
                  {localize(training.description)} ·{" "}
                  {t("training.minutesAbbrev", {
                    count: training.estimatedMinutes,
                  })}
                </p>
              </div>
              {status === "active" && (
                <Button
                  type="primary"
                  onClick={() => startModule(training.id, training.path)}
                >
                  {t("training.continue")}
                </Button>
              )}
              {status === "completed" && (
                <span className="status-label completed">
                  {t("training.moduleStatusCompleted")}
                </span>
              )}
              {status === "locked" && (
                <span className="status-label locked">
                  {t("training.moduleStatusLocked")}
                </span>
              )}
            </ModuleItem>
          );
        })}
      </ModuleList>

      <CertificateHint>
        <ClockCircleOutlined />
        <span>
          <Trans
            i18nKey="training.certificateHint"
            values={{ count: total }}
            components={{ b: <strong /> }}
          />
        </span>
      </CertificateHint>
    </Modal>
  );
}
