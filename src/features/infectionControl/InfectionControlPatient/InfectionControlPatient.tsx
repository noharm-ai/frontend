import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Tag, Tooltip } from "antd";
import { Dayjs } from "dayjs";

import DefaultModal from "components/Modal";
import PatientNameCache from "components/PatientName/PatientNameCache";
import { getCorporalSurface, getIMC } from "utils/index";
import { formatDate } from "utils/date";
import { formatNumber } from "utils/number";

import { IInfectionControlPatient } from "../InfectionControlSlice";
import { daysSince, getAge } from "../timeline";
import { AdmissionBody, PatientBox } from "./InfectionControlPatient.style";

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

const DataList = ({ items }: { items: IDataItem[] }) => (
  <div className="patient-data">
    {items.map((item) => (
      <div className="patient-data-item" key={item.key}>
        <div className="patient-data-item-label">{item.label}</div>
        <div className="patient-data-item-value">
          {item.value ?? "-"}
          {item.value != null && item.extra && (
            <span className="small">{item.extra}</span>
          )}
        </div>
      </div>
    ))}
  </div>
);

/**
 * The patient's name and measures in one row: age, gender, weight, height and what
 * follows from them. The admission data (department, bed, dates...) is one
 * click away, in a modal
 */
export function InfectionControlPatient({
  patient,
  reference,
}: InfectionControlPatientProps) {
  const { t } = useTranslation();
  const [admissionOpen, setAdmissionOpen] = useState(false);

  const age = getAge(patient.birthdate, reference);
  const gender =
    patient.gender === "M"
      ? t("infectionControl.patient.male")
      : patient.gender === "F"
        ? t("infectionControl.patient.female")
        : null;
  const { weight, height } = patient;

  // the long names are clipped by the cell, so they show whole on hover
  const withTooltip = (value: string | null) =>
    value ? <Tooltip title={value}>{value}</Tooltip> : null;

  const patientItems: IDataItem[] = [
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
      extra: patient.birthdate ? formatDate(patient.birthdate) : null,
    },
    {
      key: "gender",
      label: t("infectionControl.patient.gender"),
      value: gender,
    },
    {
      key: "weight",
      label: t("infectionControl.patient.weight"),
      value: weight ? `${weight} kg` : null,
      extra: patient.weightDate
        ? formatDate(patient.weightDate, "DD/MM")
        : null,
    },
    {
      key: "height",
      label: t("patientCard.height"),
      value: height ? `${height} cm` : null,
    },
    {
      key: "bmi",
      label: t("patientCard.bmi"),
      value: weight && height ? formatNumber(getIMC(weight, height), 2) : null,
      extra: "kg/m²",
    },
    {
      key: "bodySurface",
      label: t("infectionControl.patient.bodySurface"),
      value:
        weight && height
          ? formatNumber(getCorporalSurface(weight, height), 3)
          : null,
      extra: "m²",
    },
  ];

  const admissionItems: IDataItem[] = [
    {
      key: "admission",
      label: t("infectionControl.patient.admission"),
      value: patient.admissionNumber,
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
      value: withTooltip(patient.department),
    },
    {
      key: "bed",
      label: t("infectionControl.patient.bed"),
      value: patient.bed,
    },
    {
      key: "segment",
      label: t("patientCard.segment"),
      value: withTooltip(patient.segment),
    },
    {
      key: "record",
      label: t("patientCard.medicalRecord"),
      value: withTooltip(patient.record),
    },
  ];

  if (patient.dischargeDate) {
    admissionItems.push({
      key: "dischargeDate",
      label: t("infectionControl.patient.dischargeDate"),
      value: formatDate(patient.dischargeDate),
      extra: patient.dischargeReason,
    });
  }

  return (
    <PatientBox data-kb="infectionControl.patient">
      <div className="patient-header">
        <h2 className="patient-name">
          <PatientNameCache idPatient={patient.idPatient} />
        </h2>
        {patient.dischargeDate && (
          <Tooltip title={patient.dischargeReason}>
            <Tag className="patient-discharge">
              {t("infectionControl.patient.dischargeDate")}{" "}
              {formatDate(patient.dischargeDate)}
            </Tag>
          </Tooltip>
        )}
        <Button
          type="link"
          size="small"
          className="patient-full-data"
          onClick={() => setAdmissionOpen(true)}
        >
          {t("infectionControl.patient.fullData")}
        </Button>
      </div>

      <DataList items={patientItems} />

      <DefaultModal
        open={admissionOpen}
        width={640}
        centered
        destroyOnHidden
        onCancel={() => setAdmissionOpen(false)}
        footer={null}
      >
        <AdmissionBody data-kb="infectionControl.admission">
          <h2 className="modal-title">{t("infectionControl.patient.title")}</h2>
          <DataList items={patientItems} />
          <h2 className="modal-title">
            {t("infectionControl.patient.admission")}
          </h2>
          <DataList items={admissionItems} />
        </AdmissionBody>
      </DefaultModal>
    </PatientBox>
  );
}
