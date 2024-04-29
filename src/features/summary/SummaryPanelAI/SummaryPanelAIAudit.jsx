import React from "react";
import { useTranslation } from "react-i18next";

import DefaultModal from "components/Modal";
import Heading from "components/Heading";

function SummaryPanelAIAudit({ audit, open, setOpen }) {
  const { t } = useTranslation();

  return (
    <DefaultModal
      width={700}
      centered
      destroyOnClose
      onCancel={() => setOpen(false)}
      open={open}
      footer={null}
    >
      <Heading>{t("labels.audit")}</Heading>
      <p>{t("summary.auditLegend")}:</p>
      <ul>
        {audit?.length ? (
          audit.map((a, i) => <li key={i}>{a}</li>)
        ) : (
          <li>Nenhum registro encontrado</li>
        )}
      </ul>
    </DefaultModal>
  );
}

export default SummaryPanelAIAudit;
