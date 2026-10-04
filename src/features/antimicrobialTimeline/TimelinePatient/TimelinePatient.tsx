import React from "react";
import { useTranslation } from "react-i18next";
import { Dayjs } from "dayjs";

import PatientNameCache from "components/PatientName/PatientNameCache";
import { formatDate } from "utils/date";

import { ITimelinePatient } from "../AntimicrobialTimelineSlice";
import { daysSince, getAge } from "../timeline";
import { PatientBox } from "../AntimicrobialTimeline/AntimicrobialTimeline.style";

interface TimelinePatientProps {
  patient: ITimelinePatient;
  // now, or the discharge date once the patient left
  reference: Dayjs;
}

interface IDataItem {
  key: string;
  label: string;
  value: React.ReactNode;
  extra?: React.ReactNode;
}

/** Patient and admission header, the same data the screening patient card leads with */
export function TimelinePatient({ patient, reference }: TimelinePatientProps) {
  const { t } = useTranslation();

  const age = getAge(patient.birthdate, reference);
  const gender =
    patient.gender === "M"
      ? t("antimicrobialTimeline.patient.male")
      : patient.gender === "F"
        ? t("antimicrobialTimeline.patient.female")
        : null;

  const items: IDataItem[] = [
    {
      key: "admission",
      label: t("antimicrobialTimeline.patient.admission"),
      value: patient.admissionNumber,
    },
    {
      key: "age",
      label: t("antimicrobialTimeline.patient.age"),
      value: age
        ? t(
            age.unit === "years"
              ? "antimicrobialTimeline.patient.ageYears"
              : "antimicrobialTimeline.patient.ageMonths",
            { count: age.value },
          )
        : null,
    },
    {
      key: "gender",
      label: t("antimicrobialTimeline.patient.gender"),
      value: gender,
    },
    {
      key: "weight",
      label: t("antimicrobialTimeline.patient.weight"),
      value: patient.weight != null ? `${patient.weight} kg` : null,
      extra: patient.weightDate ? formatDate(patient.weightDate) : null,
    },
    {
      key: "admissionDate",
      label: t("antimicrobialTimeline.patient.admissionDate"),
      value: patient.admissionDate ? formatDate(patient.admissionDate) : null,
      extra: patient.admissionDate
        ? t("antimicrobialTimeline.patient.lengthOfStay", {
            count: daysSince(patient.admissionDate, reference),
          })
        : null,
    },
    {
      key: "department",
      label: t("antimicrobialTimeline.patient.department"),
      value: patient.department,
    },
    {
      key: "bed",
      label: t("antimicrobialTimeline.patient.bed"),
      value: patient.bed,
    },
  ];

  if (patient.dischargeDate) {
    items.push({
      key: "dischargeDate",
      label: t("antimicrobialTimeline.patient.dischargeDate"),
      value: formatDate(patient.dischargeDate),
      extra: patient.dischargeReason,
    });
  }

  return (
    <PatientBox data-kb="antimicrobialTimeline.patient">
      <div className="patient-name">
        <PatientNameCache idPatient={patient.idPatient} />
      </div>

      <div className="patient-data">
        {items.map((item) => (
          <div className="patient-data-item" key={item.key}>
            <span className="patient-data-label">{item.label}</span>
            <span className="patient-data-value">
              {item.value ?? "-"}
              {item.extra && (
                <span className="patient-data-extra">({item.extra})</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </PatientBox>
  );
}
