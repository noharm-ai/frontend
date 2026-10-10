import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "antd";
import { WarningOutlined } from "@ant-design/icons";

import IntegrationStatus from "models/IntegrationStatus";
import { useAppSelector } from "src/store";

import { useTrainingStatus } from "../useTrainingStatus";
import { PendingTrainingPill } from "./TrainingStatusIndicator.style";

export function TrainingStatusIndicator() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isPending, remaining } = useTrainingStatus();
  const integrationStatus = useAppSelector(
    (state) => (state.app as any).config.integrationStatus,
  );

  // pending training only matters once the schema is in production: during
  // integration the team is still setting the client up
  if (!isPending || integrationStatus !== IntegrationStatus.PRODUCTION) {
    return null;
  }

  return (
    <Tooltip
      title={t("layout.pendingTrainingTooltip", { count: remaining })}
      placement="bottom"
    >
      <PendingTrainingPill
        type="button"
        id="gtm-btn-pending-training"
        onClick={() => navigate("/treinamento")}
      >
        <WarningOutlined />
        <span className="pill-label">{t("layout.pendingTraining")}</span>
        <span className="pill-count">{remaining}</span>
      </PendingTrainingPill>
    </Tooltip>
  );
}
