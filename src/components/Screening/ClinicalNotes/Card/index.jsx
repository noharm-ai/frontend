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

  const prepareValue = (value) => {
    if (value > 99) {
      return "99+";
    }

    return value;
  };

  return (
    <PrescriptionCard
      style={{ minHeight: featureService.hasPrimaryCare() ? "113px" : "auto" }}
    >
      <div className="header">
        <h3 className="title">
          {t("tableHeader.clinicalNotes")}
          {!featureService.hasPrimaryCare() && (
            <Button
              type="link gtm-btn-notes-all"
              style={{ paddingRight: 0 }}
              onClick={() => setClinicalNotesVisibility(true)}
            >
              Visualizar
            </Button>
          )}
        </h3>
      </div>
      <div className="content">
        <div className="stat-number">
          {featureService.hasPrimaryCare() && <>{prepareValue(total)}</>}
        </div>
      </div>
      <div className="footer">
        {featureService.hasPrimaryCare() ? (
          <>
            <div></div>
            <div className="action">
              <Button
                type="link gtm-btn-notes-all"
                onClick={() => setClinicalNotesVisibility(true)}
              >
                Visualizar
              </Button>
            </div>
          </>
        ) : (
          <div className="stats">
            {ClinicalNotesIndicator.listByCategory("priority", t).map(
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

      <ClinicalNotesModal
        visible={clinicalNotesVisible}
        setVisibility={setClinicalNotesVisibility}
      />
    </PrescriptionCard>
  );
}
