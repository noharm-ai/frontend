import React from "react";
import { useTranslation } from "react-i18next";
import { EditOutlined } from "@ant-design/icons";

import Button from "components/Button";
import RichTextView from "components/RichTextView";

export default function NotesTab({ prescription, setPatientModalVisible }) {
  const { t } = useTranslation();
  const { observation } = prescription;

  return (
    <div className="patient-data">
      <div className="patient-data-item full edit">
        <div className="patient-data-item-label">{t("patientCard.notes")}</div>
        <div className="patient-data-item-value text">
          <div className="notes">
            <RichTextView text={observation} />
          </div>
        </div>
        <div className="patient-data-item-edit text">
          <Button
            type="link"
            onClick={() => setPatientModalVisible(true)}
            icon={<EditOutlined style={{ fontSize: 18, color: "#fff" }} />}
          ></Button>
        </div>
      </div>
    </div>
  );
}
