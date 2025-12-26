import "styled-components";

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
  FilePptOutlined,
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
import {
  shouldUpdatePrescription,
  getPepLink,
} from "features/serverActions/ServerActionsSlice";
import { getErrorMessage } from "utils/errorHandler";
import { setChooseConciliationModal } from "features/prescription/PrescriptionSlice";
import { searchAggPrescriptions } from "features/lists/ListsSlice";
import {
  trackPrescriptionAction,
  TrackedPrescriptionAction,
} from "src/utils/tracker";

import PatientName from "containers/PatientName";

import PatientTab from "./PatientTab";
import AdmissionTab from "./AdmissionData";
import NotesTab from "./NotesTab";
import TagsTab from "./TagsTab";
import { ProtocolsTab } from "./ProtocolsTab";
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

  const interventionTooltip = t("patientCard.patientIntervention");
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

  const hasProtocolAlerts = () => {
    if (!prescription?.protocolAlerts) {
      return false;
    }

    const protocolAlerts = prescription.protocolAlerts;
    const protocolGroups = Object.keys(protocolAlerts)
      .filter((a) => a !== "summary" && a !== "items")
      .sort()
      .reverse();
    return protocolGroups.some((g) => protocolAlerts[g].length > 0);
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
    trackPrescriptionAction(TrackedPrescriptionAction.RECALCULATE_PRESCRIPTION);

    notification.info({
      message: "Recalculando prescrição",
    });
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
    trackPrescriptionAction(TrackedPrescriptionAction.OPEN_AGG_PRESCRIPTION);

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

  const openPep = (idPrescription) => {
    trackPrescriptionAction(TrackedPrescriptionAction.OPEN_PEP);

    notification.info({
      message: "Abrindo link PEP. Aguarde...",
    });
    dispatch(getPepLink({ idPrescription })).then((response) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        const link = response.payload.data?.pepLink;
        if (link) {
          console.debug("link", link);
          window.open(link);
        } else {
          notification.error({
            message: "Erro inesperado ao abrir link PEP",
          });
        }
      }
    });
  };

  const setModalVisibilityTracked = (modal, open) => {
    setModalVisibility(modal, open);
    if (open) {
      switch (modal) {
        case "patientEdit":
          trackPrescriptionAction(TrackedPrescriptionAction.EDIT_PATIENT);
          break;
        case "clinicalNotes":
          trackPrescriptionAction(
            TrackedPrescriptionAction.SHOW_CLINICAL_NOTES,
            { params: open }
          );
          break;
      }
    }
  };

  const handleMenuClick = async ({ key, domEvent }) => {
    switch (key) {
      case "edit":
        setModalVisibilityTracked("patientEdit", true);
        break;
      case "update":
        updatePrescriptionData();
        break;
      case "gotoAgg":
        openAggPrescription();
        break;
      case "openConciliation":
        dispatch(setChooseConciliationModal(prescription.admissionNumber));
        trackPrescriptionAction(TrackedPrescriptionAction.OPEN_CONCILIATION);
        break;
      case "gotoPep":
        openPep(prescription.idPrescription);
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

    if (featureService.hasShowPepLink()) {
      items.push({
        key: "gotoPep",
        label: t("patientCard.pepLink"),
        id: "gtm-bt-gotopep",
        icon: <ExportOutlined />,
      });
    }

    return {
      items,
      onClick: handleMenuClick,
    };
  };

  const getProtocolBadgeColor = () => {
    const alertLevels = [];

    if (prescription?.protocolAlerts) {
      const protocolGroups = Object.keys(prescription.protocolAlerts)
        .filter((a) => a !== "summary" && a !== "items")
        .sort()
        .reverse();

      protocolGroups.forEach((g) => {
        if (prescription.protocolAlerts[g].length) {
          prescription.protocolAlerts[g].forEach((al) => {
            alertLevels.push(al.level);
          });
        }
      });
    }

    if (alertLevels.indexOf("high") !== -1) {
      return "#f44336";
    }

    if (alertLevels.indexOf("medium") !== -1) {
      return "#f57f17";
    }

    return "#ffc107";
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
          setModalVisibility={setModalVisibilityTracked}
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
          setModalVisibility={setModalVisibilityTracked}
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
          setModalVisibility={setModalVisibilityTracked}
          setSeeMore={setSeeMore}
        />
      ),
    },
    {
      key: "patientTags",
      label: (
        <Tooltip title="Marcadores">
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
          setModalVisibility={setModalVisibilityTracked}
          setSeeMore={setSeeMore}
        />
      ),
    },
  ];

  if (featureService.hasProtocolAlerts()) {
    tabs.push({
      key: "protocolAlerts",
      label: (
        <Tooltip title={t("labels.protocolAlerts")}>
          {hasProtocolAlerts() ? (
            <Badge dot color={getProtocolBadgeColor()}>
              <FilePptOutlined style={{ fontSize: "18px" }} />
            </Badge>
          ) : (
            <FilePptOutlined style={{ fontSize: "18px" }} />
          )}
        </Tooltip>
      ),
      children: <ProtocolsTab protocolAlerts={prescription.protocolAlerts} />,
    });
  }

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

  const onChangeTab = (activeKey) => {
    switch (activeKey) {
      case "reports":
        trackPrescriptionAction(TrackedPrescriptionAction.TAB_REPORTS);
        break;
      case "protocolAlerts":
        trackPrescriptionAction(TrackedPrescriptionAction.TAB_PROTOCOL);
        break;
      case "patientTags":
        trackPrescriptionAction(TrackedPrescriptionAction.TAB_MARKER);
        break;
      case "patientNotes":
        trackPrescriptionAction(TrackedPrescriptionAction.TAB_NOTES);
        break;
      case "admissionData":
        trackPrescriptionAction(TrackedPrescriptionAction.TAB_ADMISSION);
        break;
    }
  };

  return (
    <PatientBox $t={t}>
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
              type="primary"
              className="gtm-bt-patient-intervention"
              onClick={() => showInterventionModal()}
              style={{ marginRight: "3px" }}
              ghost={!hasIntervention}
              icon={<WarningOutlined style={{ fontSize: 16 }} />}
            ></Button>
          </Tooltip>
          <Spin spinning={aggPrescriptionStatus === "loading"}>
            <Dropdown menu={prescriptionOptions()} trigger={["click"]}>
              <div>
                <Tooltip title="Menu">
                  <button className="patient-menu gtm-bt-patient-menu">
                    <MoreOutlined style={{ fontSize: 28 }} />
                  </button>
                </Tooltip>
              </div>
            </Dropdown>
          </Spin>
        </div>
      </div>
      <div className="patient-body">
        <Tabs
          defaultActiveKey="patientData"
          type="card"
          items={tabs}
          onChange={onChangeTab}
        ></Tabs>
      </div>
    </PatientBox>
  );
}
