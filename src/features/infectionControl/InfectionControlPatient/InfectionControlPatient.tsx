import React from "react";
import { useTranslation } from "react-i18next";
import { Dayjs } from "dayjs";

import PatientNameCache from "components/PatientName/PatientNameCache";
import { formatDate } from "utils/date";

import { IInfectionControlPatient } from "../InfectionControlSlice";
import { daysSince, getAge } from "../timeline";
import { PatientBox } from "../InfectionControl/InfectionControl.style";

interface InfectionControlPatientProps {
  patient: IInfectionControlPatient;
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
export function InfectionControlPatient({
  patient,
  reference,
}: InfectionControlPatientProps) {
  const { t } = useTranslation();

  const age = getAge(patient.birthdate, reference);
  const gender =
    patient.gender === "M"
      ? t("infectionControl.patient.male")
      : patient.gender === "F"
        ? t("infectionControl.patient.female")
        : null;

  const items: IDataItem[] = [
    {
      key: "admission",
      label: t("infectionControl.patient.admission"),
      value: patient.admissionNumber,
    },
    {
      key: "age",
      label: t("infectionControl.patient.age"),
      value: age
        ? t(
            age.unit === "years"
              ? "infectionControl.patient.ageYears"
              : "infectionControl.patient.ageMonths",
            { count: age.value },
          )
        : null,
    },
    {
      key: "gender",
      label: t("infectionControl.patient.gender"),
      value: gender,
    },
    {
      key: "weight",
      label: t("infectionControl.patient.weight"),
      value: patient.weight != null ? `${patient.weight} kg` : null,
      extra: patient.weightDate ? formatDate(patient.weightDate) : null,
    },
    {
      key: "admissionDate",
      label: t("infectionControl.patient.admissionDate"),
      value: patient.admissionDate ? formatDate(patient.admissionDate) : null,
      extra: patient.admissionDate
        ? t("infectionControl.patient.lengthOfStay", {
            count: daysSince(patient.admissionDate, reference),
          })
        : null,
    },
    {
      key: "department",
      label: t("infectionControl.patient.department"),
      value: patient.department,
    },
    {
      key: "bed",
      label: t("infectionControl.patient.bed"),
      value: patient.bed,
    },
  ];

  if (patient.dischargeDate) {
    items.push({
      key: "dischargeDate",
      label: t("infectionControl.patient.dischargeDate"),
      value: formatDate(patient.dischargeDate),
      extra: patient.dischargeReason,
    });
  }

  return (
    <PatientBox data-kb="infectionControl.patient">
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
