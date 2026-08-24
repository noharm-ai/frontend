import React from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Alert } from "antd";

import Tag from "components/Tag";
import InterventionStatus from "models/InterventionStatus";

export function ConfirmStep() {
  const { t } = useTranslation();
  const outcome = useSelector(
    (state) => state.multipleInterventionOutcome.outcome,
  );
  const idInterventionList = useSelector(
    (state) => state.multipleInterventionOutcome.idInterventionList,
  );

  const status = InterventionStatus.translate(outcome, t);

  return (
    <>
      <p>
        {t("multipleIntervention.confirmList", {
          count: idInterventionList.length,
        })}{" "}
        <Tag color={status.color}>{status.label}</Tag>
      </p>

      <Alert
        type="info"
        showIcon
        message={t("multipleIntervention.confirmNote")}
      />
    </>
  );
}
