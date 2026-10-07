import React from "react";
import { useTranslation } from "react-i18next";
import { Tabs, Tooltip } from "antd";
import { FileOutlined, UserOutlined } from "@ant-design/icons";
import { Dayjs } from "dayjs";

import PatientNameCache from "components/PatientName/PatientNameCache";
import { InfoIcon } from "components/Icon";
import { getCorporalSurface, getIMC } from "utils/index";
import { formatDate } from "utils/date";

import { IInfectionControlPatient } from "../InfectionControlSlice";
import { daysSince, getAge } from "../timeline";
import { PatientBox } from "./InfectionControlPatient.style";

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

const DataGrid = ({ items }: { items: IDataItem[] }) => (
  <div className="patient-data">
    {items.map((item) => (
      <div className="patient-data-item" key={item.key}>
        <div className="patient-data-item-label">{item.label}</div>
        <div className="patient-data-item-value">
          {item.value ?? "-"}
          {item.extra && <span className="small">({item.extra})</span>}
        </div>
      </div>
    ))}
  </div>
);

/**
 * Patient and admission card, laid out like the screening patient card: the
 * name on top and the patient and admission data in icon tabs
 */
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
      key: "height",
      label: t("patientCard.height"),
      value: height ? `${height} cm` : null,
    },
    {
      key: "weight",
      label: t("infectionControl.patient.weight"),
      value: weight ? `${weight} kg` : null,
      extra: patient.weightDate ? formatDate(patient.weightDate) : null,
    },
    {
      key: "bmi",
      label: t("patientCard.bmi"),
      value:
        weight && height ? `${getIMC(weight, height).toFixed(2)} kg/m²` : null,
    },
    {
      key: "bodySurface",
      label: t("patientCard.bodySurface"),
      value:
        weight && height
          ? `${getCorporalSurface(weight, height).toFixed(3)} m²`
          : null,
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

  const tabs = [
    {
      key: "patientData",
      label: (
        <Tooltip title={t("patientCard.patientData")}>
          <UserOutlined aria-label={t("patientCard.patientData")} />
        </Tooltip>
      ),
      children: <DataGrid items={patientItems} />,
    },
    {
      key: "admissionData",
      label: (
        <Tooltip title={t("patientCard.admissionData")}>
          <FileOutlined aria-label={t("patientCard.admissionData")} />
        </Tooltip>
      ),
      children: <DataGrid items={admissionItems} />,
    },
  ];

  return (
    <PatientBox data-kb="infectionControl.patient">
      <div className="patient-header">
        <div className="patient-header-name">
          <PatientNameCache idPatient={patient.idPatient} />
          {patient.dischargeDate && " "}
          {patient.dischargeDate && (
            <Tooltip
              title={`${t("infectionControl.patient.dischargeDate")}: ${formatDate(
                patient.dischargeDate,
              )}${patient.dischargeReason ? ` (${patient.dischargeReason})` : ""}`}
            >
              <span>
                <InfoIcon />
              </span>
            </Tooltip>
          )}
        </div>
      </div>

      <Tabs defaultActiveKey="patientData" type="card" items={tabs} />
    </PatientBox>
  );
}
