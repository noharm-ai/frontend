import React from "react";
import { useTranslation } from "react-i18next";

import Tooltip from "components/Tooltip";
import { formatDate } from "src/utils/date";

export default function AdmissionTab({ prescription }) {
  const { t } = useTranslation();
  const {
    admissionNumber,
    admissionDate,
    department,
    lastDepartment,
    segmentName,
    bed,
    prescriber,
    insurance,
    dischargeDateForecast,
    responsiblePhysician,
  } = prescription;
  return (
    <div className="patient-data">
      <div className="patient-data-item">
        <div className="patient-data-item-label">
          {t("patientCard.admission")}
        </div>
        <div className="patient-data-item-value">{admissionNumber}</div>
      </div>

      <div className="patient-data-item">
        <div className="patient-data-item-label">
          {t("patientCard.admissionDate")}
        </div>
        <div className="patient-data-item-value">{admissionDate}</div>
      </div>

      <div className="patient-data-item">
        <div className="patient-data-item-label">
          {t("patientCard.department")}
        </div>
        <div className="patient-data-item-value">
          <Tooltip title={department}>{department}</Tooltip>
        </div>
      </div>

      <div className="patient-data-item">
        <div className="patient-data-item-label">
          {t("patientCard.previousDepartment")}
        </div>
        <div className="patient-data-item-value">
          {lastDepartment && department !== lastDepartment ? (
            <Tooltip title={lastDepartment}>{lastDepartment}</Tooltip>
          ) : (
            "--"
          )}
        </div>
      </div>

      <div className="patient-data-item">
        <div className="patient-data-item-label">{t("patientCard.bed")}</div>
        <div className="patient-data-item-value">{bed}</div>
      </div>

      <div className="patient-data-item">
        <div className="patient-data-item-label">
          {t("patientCard.segment")}
        </div>
        <div className="patient-data-item-value">
          <Tooltip title={segmentName}>{segmentName}</Tooltip>
        </div>
      </div>

      <div className="patient-data-item">
        <div className="patient-data-item-label">{t("labels.insurance")}</div>
        <div className="patient-data-item-value">
          <Tooltip title={insurance}>{insurance}</Tooltip>
        </div>
      </div>

      <div className="patient-data-item">
        <div className="patient-data-item-label">
          {t("patientCard.prescriber")}
        </div>
        <div className="patient-data-item-value">
          <Tooltip title={prescriber}>{prescriber}</Tooltip>
        </div>
      </div>

      {responsiblePhysician && (
        <div className="patient-data-item">
          <div className="patient-data-item-label">
            {t("patientCard.responsiblePhysician")}
          </div>
          <div className="patient-data-item-value">{responsiblePhysician}</div>
        </div>
      )}

      {dischargeDateForecast && (
        <div className="patient-data-item">
          <div className="patient-data-item-label">
            {t("patientCard.dischargeDateForecast")}
          </div>
          <div className="patient-data-item-value">
            {formatDate(dischargeDateForecast)}
          </div>
        </div>
      )}
    </div>
  );
}
