import "styled-components/macro";
import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  EditOutlined,
  RedoOutlined,
  WarningOutlined,
  UserOutlined,
  MoreOutlined,
  FileOutlined,
  MessageOutlined,
} from "@ant-design/icons";

import api from "services/api";
import Button from "components/Button";
import { InfoIcon } from "components/Icon";
import Tooltip from "components/Tooltip";
import Tabs from "components/Tabs";
import Dropdown from "components/Dropdown";
import Badge from "components/Badge";

import FormIntervention from "containers/Forms/Intervention";
import PatientName from "containers/PatientName";

import PatientTab from "./PatientTab";
import AdmissionTab from "./AdmissionData";
import NotesTab from "./NotesTab";
import { PatientBox } from "../Patient.style";

export default function PatientCard({
  prescription,
  checkPrescriptionDrug,
  selectIntervention,
  access_token,
  setSeeMore,
  fetchScreening,
  setPatientModalVisible,
  featureService,
}) {
  const [interventionVisible, setInterventionVisibility] = useState(false);
  const { t } = useTranslation();

  const hasNoHarmCare = featureService.hasNoHarmCare();
  const {
    admissionNumber,
    age,
    dischargeReason,
    dischargeFormated,
    namePatient,
    observation,
    intervention,
    prevIntervention,
    existIntervention,
    concilia,
  } = prescription;

  const closedStatus = ["a", "n", "x"];
  const currentStatus = intervention ? intervention.status : "s";
  const isInterventionClosed = closedStatus.indexOf(currentStatus) !== -1;
  let interventionTooltip = t("patientCard.patientIntervention");

  if (isInterventionClosed) {
    interventionTooltip = t("patientCard.patientInterventionDisabled");
  }

  const showInterventionModal = () => {
    selectIntervention({
      idPrescriptionDrug: "0",
      admissionNumber,
      idPrescription: prescription.idPrescription,
      idSegment: prescription.idSegment,
      patientName: namePatient,
      age,
      status: intervention ? intervention.status : "0",
      intervention: intervention || {
        id: 0,
        idPrescription: prescription.idPrescription,
      },
    });
    setInterventionVisibility(true);
  };

  const updatePrescriptionData = useCallback(async () => {
    await api.shouldUpdatePrescription(
      access_token,
      prescription.idPrescription
    );
    fetchScreening(prescription.idPrescription);
  }, [access_token, fetchScreening, prescription.idPrescription]);

  const dischargeMessage = (dischargeFormated, dischargeReason) => {
    if (dischargeFormated) {
      const reason = dischargeReason || "alta";
      return (
        <Tooltip title={`Paciente com ${reason} em ${dischargeFormated}`}>
          {" "}
          <InfoIcon />
        </Tooltip>
      );
    }
  };

  const handleMenuClick = ({ key, domEvent }) => {
    switch (key) {
      case "edit":
        setPatientModalVisible(true);
        break;
      case "update":
        updatePrescriptionData();
        break;
      default:
        console.error("Invalid key", key);
    }

    domEvent.stopPropagation();
  };

  const prescriptionOptions = () => {
    const items = [
      {
        key: "edit",
        label: t("actions.edit"),
        icon: <EditOutlined />,
        id: "gtm-bt-edit-patient",
      },
    ];

    if (!concilia) {
      items.push({
        key: "update",
        label: t("patientCard.recalculate"),
        id: "gtm-bt-update",
        icon: <RedoOutlined />,
      });
    }

    return {
      items,
      onClick: handleMenuClick,
    };
  };

  const tabs = [
    {
      key: "patientData",
      label: (
        <Tooltip title={t("patientCard.patientData")}>
          <UserOutlined style={{ fontSize: "18px" }} />
        </Tooltip>
      ),
      children: (
        <PatientTab
          prescription={prescription}
          setPatientModalVisible={setPatientModalVisible}
          setSeeMore={setSeeMore}
          hasNoHarmCare={hasNoHarmCare}
        />
      ),
    },
    {
      key: "admissionData",
      label: (
        <Tooltip title={t("patientCard.admissionData")}>
          <FileOutlined style={{ fontSize: "18px" }} />
        </Tooltip>
      ),
      children: (
        <AdmissionTab
          prescription={prescription}
          setPatientModalVisible={setPatientModalVisible}
          setSeeMore={setSeeMore}
          hasNoHarmCare={hasNoHarmCare}
        />
      ),
    },
    {
      key: "patientNotes",
      label: (
        <Tooltip title={t("patientCard.notes")}>
          {observation ? (
            <Badge dot>
              <MessageOutlined style={{ fontSize: "18px" }} />
            </Badge>
          ) : (
            <MessageOutlined style={{ fontSize: "18px" }} />
          )}
        </Tooltip>
      ),
      children: (
        <NotesTab
          prescription={prescription}
          setPatientModalVisible={setPatientModalVisible}
          setSeeMore={setSeeMore}
          hasNoHarmCare={hasNoHarmCare}
        />
      ),
    },
  ];

  return (
    <PatientBox t={t}>
      <div className="patient-header">
        <div
          className={`patient-header-name ${
            intervention && intervention.status === "s" && "has-intervention"
          }`}
        >
          <PatientName idPatient={prescription.idPatient} name={namePatient} />
          {dischargeMessage(dischargeFormated, dischargeReason)}
        </div>
        <div className="patient-header-action">
          {prevIntervention && (
            <Tooltip title="Possui intervenção anterior (consulte a aba Intervenções)">
              <WarningOutlined
                style={{ fontSize: 18, color: "#fa8c16", marginRight: "5px" }}
              />
            </Tooltip>
          )}
          {!prevIntervention && existIntervention && (
            <Tooltip title="Possui intervenção anterior já resolvida (consulte a aba Intervenções)">
              <WarningOutlined
                style={{ fontSize: 18, color: "gray", marginRight: "5px" }}
              />
            </Tooltip>
          )}

          <Tooltip title={interventionTooltip}>
            <Button
              type="primary gtm-bt-patient-intervention"
              onClick={() => showInterventionModal()}
              style={{ marginRight: "3px" }}
              ghost={!intervention || intervention.status !== "s"}
              disabled={isInterventionClosed}
              icon={<WarningOutlined style={{ fontSize: 16 }} />}
            ></Button>
          </Tooltip>

          <Dropdown menu={prescriptionOptions()} trigger={["click"]}>
            <Tooltip title="Menu">
              <button className="patient-menu gtm-bt-patient-menu">
                <MoreOutlined style={{ fontSize: 28 }} />
              </button>
            </Tooltip>
          </Dropdown>
        </div>
      </div>
      <div className="patient-body">
        <Tabs defaultActiveKey="patientData" type="card" items={tabs}></Tabs>
      </div>

      <FormIntervention
        open={interventionVisible}
        setVisibility={setInterventionVisibility}
        checkPrescriptionDrug={checkPrescriptionDrug}
      />
    </PatientBox>
  );
}
