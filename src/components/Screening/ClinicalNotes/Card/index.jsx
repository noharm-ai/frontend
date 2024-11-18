import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import PrescriptionCard from "components/PrescriptionCard";
import Button from "components/Button";
import Tag from "components/Tag";
import Tooltip from "components/Tooltip";

import ClinicalNotesIndicator from "../ClinicalNotesIndicator";
import ClinicalNotesModal from "containers/Screening/ClinicalNotes/Modal";

export default function ClinicalNotesCard({ stats, total, featureService }) {
  const [clinicalNotesVisible, setClinicalNotesVisibility] = useState(false);
  const { t } = useTranslation();
  const indicatorKeys =
    window.innerWidth < 1980
      ? ["diseases", "complication", "medications", "symptoms"]
      : ["diseases", "complication", "germes", "medications", "symptoms"];

  const prepareValue = (value) => {
    if (value > 99) {
      return "99+";
    }

    return value;
  };

  return (
    <PrescriptionCard style={{ minHeight: "113px" }}>
      <div className="header">
        <h3 className="title">{t("tableHeader.clinicalNotes")}</h3>
      </div>
      <div className="content">
        {featureService.hasPrimaryCare() ? (
          <div className="stat-number">{prepareValue(total)}</div>
        ) : (
          <div className="stats stats-center" style={{ marginTop: "6px" }}>
            {ClinicalNotesIndicator.listByKey(indicatorKeys, t).map(
              (indicator) => (
                <React.Fragment key={indicator.key}>
                  <div>
                    <Tooltip title={indicator.label}>
                      <Tag className={indicator.key}>
                        {prepareValue(stats[indicator.key] || 0)}
                      </Tag>
                    </Tooltip>
                  </div>
                </React.Fragment>
              )
            )}
          </div>
        )}
      </div>
      <div className="footer" style={{ marginTop: 0 }}>
        <div></div>
        <div className="action">
          <Button
            type="link gtm-btn-notes-all"
            onClick={() => setClinicalNotesVisibility(true)}
          >
            Visualizar
          </Button>
        </div>
      </div>

      <ClinicalNotesModal
        visible={clinicalNotesVisible}
        setVisibility={setClinicalNotesVisibility}
      />
    </PrescriptionCard>
  );
}
