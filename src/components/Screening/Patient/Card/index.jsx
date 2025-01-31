import "styled-components/macro";

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  EditOutlined,
  RedoOutlined,
  WarningOutlined,
  UserOutlined,
  MoreOutlined,
  FileOutlined,
  MessageOutlined,
  PieChartOutlined,
  ExportOutlined,
  ReconciliationOutlined,
  TagsOutlined,
} from "@ant-design/icons";

import Button from "components/Button";
import { InfoIcon } from "components/Icon";
import Tooltip from "components/Tooltip";
import Tabs from "components/Tabs";
import Dropdown from "components/Dropdown";
import Badge from "components/Badge";
import DefaultModal from "components/Modal";
import { filterInterventionByPrescription } from "utils/transformers/intervention";
import ChooseInterventionModal from "components/Screening/PrescriptionDrug/components/ChooseInterventionModal";
import notification from "components/notification";
import { shouldUpdatePrescription } from "features/serverActions/ServerActionsSlice";
import { getErrorMessage } from "utils/errorHandler";
import { setChooseConciliationModal } from "features/prescription/PrescriptionSlice";
import { searchAggPrescriptions } from "features/lists/ListsSlice";

import PatientName from "containers/PatientName";

import PatientTab from "./PatientTab";
import AdmissionTab from "./AdmissionData";
import NotesTab from "./NotesTab";
import TagsTab from "./TagsTab";
import ReportsTab from "./ReportsTab";
import { PatientBox } from "../Patient.style";
import { Spin } from "antd";

export default function PatientCard({
  prescription,
  selectIntervention,
  setSeeMore,
  fetchScreening,
  setModalVisibility,
  interventions,
  featureService,
}) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const aggPrescriptionStatus = useSelector(
    (state) => state.lists.searchAggPrescriptions.status
  );

  const {
    admissionNumber,
    age,
    dischargeReason,
    dischargeFormated,
    namePatient,
    observation,
    prevIntervention,
    existIntervention,
    concilia,
  } = prescription;

  let interventionTooltip = t("patientCard.patientIntervention");
  const hasIntervention =
    interventions.filter(
      filterInterventionByPrescription(prescription.idPrescription)
    ).length > 0;

  const selectInterventionData = (int, data) => {
    selectIntervention({
      ...data,
      intervention: {
        ...int,
      },
    });
  };

  const showInterventionModal = () => {
    const data = {
      idPrescriptionDrug: "0",
      admissionNumber,
      idPrescription: prescription.idPrescription,
      idSegment: prescription.idSegment,
      patientName: namePatient,
      age,
      intervention: {
        nonce: Math.random(),
      },
    };

    const intvList = interventions.filter(
      filterInterventionByPrescription(data.idPrescription)
    );

    if (intvList.length > 0) {
      const modal = DefaultModal.info({
        title: "Intervenções",
        content: null,
        icon: null,
        width: 500,
        okText: "Fechar",
        okButtonProps: { type: "default" },
        wrapClassName: "default-modal",
      });

      modal.update({
        content: (
          <ChooseInterventionModal
            selectIntervention={selectInterventionData}
            interventions={intvList}
            completeData={data}
            modalRef={modal}
            translate={t}
          />
        ),
      });
    } else {
      selectIntervention({
        ...data,
        intervention: {},
      });
    }
  };

  const updatePrescriptionData = () => {
    dispatch(
      shouldUpdatePrescription({ idPrescription: prescription.idPrescription })
    ).then((response) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        notification.success({
          message: "Prescrição atualizada",
        });

        fetchScreening(prescription.idPrescription);
      }
    });
  };

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

  const fetchAggPrescriptions = async (value) => {
    const response = await dispatch(searchAggPrescriptions({ term: value }));
    return response.payload.data;
  };

  const openAggPrescription = async () => {
    const aggPrescriptions = await fetchAggPrescriptions(
      prescription.admissionNumber
    );
    const prescriptionResult = aggPrescriptions.find((p) => !p.concilia);
    if (prescriptionResult) {
      window.open(`/prescricao/${prescriptionResult.idPrescription}`);
    } else {
      notification.error({
        message: "Não foi possível encontrar a Prescrição-Dia deste paciente.",
      });
    }
  };

  const handleMenuClick = async ({ key, domEvent }) => {
    switch (key) {
      case "edit":
        setModalVisibility("patientEdit", true);
        break;
      case "update":
        updatePrescriptionData();
        break;
      case "gotoAgg":
        openAggPrescription();
        break;
      case "openConciliation":
        dispatch(setChooseConciliationModal(prescription.admissionNumber));
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

      if (featureService.hasConciliation()) {
        items.push({
          key: "openConciliation",
          label: t("patientCard.openConciliation"),
          id: "gtm-bt-concilia",
          icon: <ReconciliationOutlined />,
        });
      }
    }

    if (!prescription.agg) {
      items.push({
        key: "gotoAgg",
        label: t("patientCard.prescriptionAggLink"),
        id: "gtm-bt-gotoagg",
        icon: <ExportOutlined />,
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
          setModalVisibility={setModalVisibility}
          setSeeMore={setSeeMore}
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
          setModalVisibility={setModalVisibility}
          setSeeMore={setSeeMore}
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
          setModalVisibility={setModalVisibility}
          setSeeMore={setSeeMore}
        />
      ),
    },
    {
      key: "patientTags",
      label: (
        <Tooltip title="Tags">
          {prescription?.patient?.tags?.length > 0 ? (
            <Badge dot>
              <TagsOutlined style={{ fontSize: "18px" }} />
            </Badge>
          ) : (
            <TagsOutlined style={{ fontSize: "18px" }} />
          )}
        </Tooltip>
      ),
      children: (
        <TagsTab
          prescription={prescription}
          setModalVisibility={setModalVisibility}
          setSeeMore={setSeeMore}
        />
      ),
    },
  ];

  if (
    (prescription.admissionReports && prescription.admissionReports.length) ||
    (prescription.admissionReportsInternal &&
      prescription.admissionReportsInternal.length)
  ) {
    tabs.push({
      key: "reports",
      label: (
        <Tooltip title={t("patientCard.reports")}>
          <PieChartOutlined style={{ fontSize: "18px" }} />
        </Tooltip>
      ),
      children: <ReportsTab prescription={prescription} />,
    });
  }

  return (
    <PatientBox t={t}>
      <div className="patient-header">
        <div
          className={`patient-header-name ${
            hasIntervention && "has-intervention"
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
              ghost={!hasIntervention}
              icon={<WarningOutlined style={{ fontSize: 16 }} />}
            ></Button>
          </Tooltip>
          <Spin spinning={aggPrescriptionStatus === "loading"}>
            <Dropdown menu={prescriptionOptions()} trigger={["click"]}>
              <Tooltip title="Menu">
                <button className="patient-menu gtm-bt-patient-menu">
                  <MoreOutlined style={{ fontSize: 28 }} />
                </button>
              </Tooltip>
            </Dropdown>
          </Spin>
        </div>
      </div>
      <div className="patient-body">
        <Tabs defaultActiveKey="patientData" type="card" items={tabs}></Tabs>
      </div>
    </PatientBox>
  );
}
