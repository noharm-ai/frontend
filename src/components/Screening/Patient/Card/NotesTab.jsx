import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { EditOutlined, ClockCircleOutlined } from "@ant-design/icons";

import Button from "components/Button";
import Tooltip from "components/Tooltip";
import RichTextView from "components/RichTextView";
import ViewReport from "components/Reports/ViewReport";
import DefaultModal from "components/Modal";
import { trackReport, TrackedReport } from "src/utils/tracker";

export default function NotesTab({ prescription, setModalVisibility }) {
  const { t } = useTranslation();
  const [currentReport, setCurrentReport] = useState(null);
  const { observation } = prescription;

  const openHistory = (type, track) => {
    setCurrentReport({
      title: null,
      type,
    });
    if (track) {
      trackReport(track);
    }
  };

  return (
    <div className="patient-data">
      <div className="patient-data-item full edit">
        <div className="patient-data-item-label">{t("patientCard.notes")}</div>
        <div className="patient-data-item-value text">
          <div className="notes">
            <RichTextView text={observation} />
          </div>
        </div>
        <div className="patient-data-item-edit text multiple-buttons">
          <Tooltip title="Editar Anotações">
            <Button
              type="link"
              onClick={() => setModalVisibility("patientEdit", true)}
              icon={<EditOutlined style={{ fontSize: 18, color: "#fff" }} />}
            />
          </Tooltip>
          <Tooltip title="Histórico de anotações">
            <Button
              type="link"
              onClick={() =>
                openHistory(
                  "PATIENT_OBSERVATION_HISTORY",
                  TrackedReport.PATIENT_OBSERVATION_HISTORY,
                )
              }
              icon={
                <ClockCircleOutlined style={{ fontSize: 18, color: "#fff" }} />
              }
            ></Button>
          </Tooltip>
        </div>
      </div>

      <DefaultModal
        title={currentReport?.title}
        destroyOnHidden
        open={currentReport != null}
        onCancel={() => setCurrentReport(null)}
        width={currentReport?.type ? "min(1440px, 100%)" : "90%"}
        footer={null}
        style={{ top: "10px", height: "100vh" }}
      >
        <ViewReport report={currentReport} prescription={prescription} />
      </DefaultModal>
    </div>
  );
}
