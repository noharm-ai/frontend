import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { isEmpty } from "lodash";
import { Formik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { RollbackOutlined } from "@ant-design/icons";

import { Row, Col } from "components/Grid";
import Button from "components/Button";
import Dropdown from "components/Dropdown";
import Tooltip from "components/Tooltip";
import notification from "components/notification";
import Heading from "components/Heading";
import DefaultModal from "components/Modal";
import InterventionReasonRelationType from "models/InterventionReasonRelationType";
import interventionStatus from "models/InterventionStatus";
import security from "services/security";
import FeaturesService from "services/features";
import { setSelectedIntervention as setSelectedInterventionOutcome } from "features/intervention/InterventionOutcome/InterventionOutcomeSlice";
import { setSelectedRowsActive } from "features/prescription/PrescriptionSlice";
import { getErrorMessageFromException } from "utils/errorHandler";

import Base from "./Base";
import PatientData from "./PatientData";
import DrugData from "./DrugData";
import { FooterContainer } from "./Intervention.style";
import { FormHeader } from "../Form.style";

export default function Intervention({
  intervention,
  reasons,
  updateInterventionData,
  reset,
  save,
  select,
  afterSaveIntervention,
  disableUndoIntervention,
  fetchReasonsList,
  searchDrugs,
  drugs,
  reasonTextMemory,
  memorySaveReasonText,
  memoryFetchReasonText,
  drugSummary,
  fetchDrugSummary,
  roles,
  features,
  aggPrescription,
  aggIdPrescription,
  prescriptionStatus,
  prescriptionHeaders,
  ...props
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isSaving, item } = intervention;
  const securityService = security(roles);
  const featureService = FeaturesService(features);

  const validationSchema = Yup.object().shape({
    idInterventionReason: Yup.array()
      .nullable()
      .min(1, t("validation.atLeastOne"))
      .required(t("validation.requiredField")),
    interactions: Yup.array()
      .nullable()
      .when("idInterventionReason", {
        is: (selectedReasons) => {
          if (isEmpty(selectedReasons) || item.idPrescriptionDrugList) {
            return false;
          }

          let isRequired = false;

          selectedReasons.forEach((itemId) => {
            const reasonIndex = reasons.list.findIndex(
              (reason) => reason.id === itemId
            );

            if (
              reasonIndex !== -1 &&
              InterventionReasonRelationType.isRequired(
                reasons.list[reasonIndex].relationType
              )
            ) {
              isRequired = true;
            }
          });

          return isRequired;
        },
        then: Yup.array()
          .nullable()
          .min(1, t("validation.atLeastOne"))
          .required(t("validation.requiredField")),
      }),
  });

  useEffect(() => {
    if (!isEmpty(item)) {
      fetchReasonsList();
    }
  }, [fetchReasonsList, item]);

  if (!item.intervention) {
    return null;
  }
  const transcriptable = {
    dose: item.dose,
    frequency: item.frequency ? item.frequency.value : null,
    frequencyLabel: item.frequency ? item.frequency.label : null,
    measureUnit: item.measureUnit ? item.measureUnit.value : null,
    measureUnitLabel: item.measureUnit ? item.measureUnit.label : null,
    route: item.route,
    idDrug: item.idDrug ? `${item.idDrug}` : null,
    idDrugLabel: item.drug,
    interval: item.interval,
    intervalLabel: item.time,
  };
  const ramData = {
    detection: item.intervention?.ram?.detection ?? null,
    internalNotificationCode:
      item.intervention?.ram?.internalNotificationCode ?? null,
    anvisaCode: item.intervention?.ram?.anvisaCode ?? null,
    brand: item.intervention?.ram?.brand ?? null,
    batch: item.intervention?.ram?.batch ?? null,
    expiration: item.intervention?.ram?.expiration ?? null,
    symptoms: item.intervention?.ram?.symptoms ?? null,
    suspended: item.intervention?.ram?.suspended ?? false,
    describedInLeaflet: item.intervention?.ram?.describedInLeaflet ?? false,
    severity: item.intervention?.ram?.severity ?? null,
    severityDetail: item.intervention?.ram?.severityDetail ?? null,
    causality: item.intervention?.ram?.causality ?? null,
  };
  const initialValues = {
    idPrescription: item.idPrescription,
    idPrescriptionDrug: item.idPrescriptionDrug,
    idPrescriptionDrugList: item.idPrescriptionDrugList,
    admissionNumber: item.admissionNumber,
    idIntervention: item.intervention.idIntervention,
    error: item.intervention.error,
    cost: item.intervention.cost,
    idInterventionReason: item.intervention.idInterventionReason,
    reasonDescription: null,
    interactions: item.intervention.interactions,
    observation: item.intervention.observation || "",
    transcription: item.intervention.transcription != null,
    economyDays: item.intervention.economyDays,
    expendedDose: item.intervention.expendedDose,
    nonce: item.intervention.nonce,
    status: item.intervention.status,
    version: "1.0",
    updateResponsible: false,
    transcriptionData: {
      ...transcriptable,
    },
    ramData,
  };

  if (item.intervention.transcription) {
    initialValues.transcriptionData = {
      ...initialValues.transcriptionData,
      ...item.intervention.transcription,
    };
  }

  const onCancel = () => {
    select({});
  };

  const getTranscriptionData = (tr) => {
    const trData = {};

    Object.keys(transcriptable).forEach((prop) => {
      if (tr[prop] !== transcriptable[prop]) {
        trData[prop] = tr[prop];
      }
    });

    if (isEmpty(trData)) {
      return null;
    }

    return trData;
  };

  const onSave = (params) => {
    const { transcription, transcriptionData } = params;
    const interventionData = {
      ...params,
      status: "s",
      transcription: transcription
        ? getTranscriptionData(transcriptionData)
        : null,
      aggIdPrescription: aggPrescription ? aggIdPrescription : null,
    };

    delete interventionData.transcriptionData;

    save(interventionData)
      .then((response) => {
        const intvList = response.data;

        if (intvList && intvList.length) {
          intvList.forEach((intv) => {
            if (afterSaveIntervention) {
              afterSaveIntervention(intv);
            } else {
              updateInterventionData(intv);
            }
          });
        }

        reset();
        select({});
        dispatch(setSelectedRowsActive(false));

        notification.success({
          message: t("success.intervention"),
        });

        if (
          params.status !== "s" &&
          params.status != null &&
          intvList &&
          intvList.length
        ) {
          dispatch(
            setSelectedInterventionOutcome({
              idIntervention: intvList[0].idIntervention,
              outcome: params.status,
              open: true,
            })
          );
        }
      })
      .catch((err) => {
        notification.error({
          message: t("error.title"),
          description: getErrorMessageFromException(err, t),
        });
      });
  };

  const InterventionFooter = ({ handleSubmit, setFieldValue }) => {
    const isChecked = item.intervention && item.intervention.status === "s";
    const closedStatuses = interventionStatus.getClosedStatuses();
    const isClosed = closedStatuses.indexOf(item.intervention.status) !== -1;

    const saveItems = [
      {
        label: "Salvar e marcar como Aceita",
        key: "a",
        disabled: item.idPrescriptionDrugList,
      },
      {
        label: "Salvar e marcar como Não Aceita",
        key: "n",
        disabled: item.idPrescriptionDrugList,
      },
      {
        label: "Salvar e marcar como Não Aceita com Justificativa",
        key: "j",
        disabled: item.idPrescriptionDrugList,
      },
      {
        label: "Salvar e marcar como Não se Aplica",
        key: "x",
        disabled: item.idPrescriptionDrugList,
      },
    ];

    const onMenuClick = ({ key }) => {
      setFieldValue("status", key);
      handleSubmit();
    };

    const undoIntervention = () => {
      save({
        idIntervention: item.intervention.idIntervention,
        status: "0",
      })
        .then((response) => {
          const intv = response.data[0];

          if (afterSaveIntervention) {
            afterSaveIntervention(intv);
          } else {
            updateInterventionData(intv);
          }
          notification.success({
            message: "Intervenção desfeita com sucesso!",
          });

          reset();
          select({});
        })
        .catch((err) => {
          notification.error({
            message: t("error.title"),
            description: getErrorMessageFromException(err, t),
          });
        });
    };

    return (
      <FooterContainer>
        <Button
          onClick={() => onCancel()}
          disabled={isSaving}
          className="gtm-bt-cancel-interv"
        >
          {t("interventionForm.btnCancel")}
        </Button>
        {isChecked && !disableUndoIntervention && (
          <Tooltip title={t("interventionForm.btnUndo")} placement="top">
            <Button
              className="gtm-bt-undo-interv"
              danger
              icon={<RollbackOutlined style={{ fontSize: 16 }} />}
              ghost
              loading={isSaving}
              onClick={() => undoIntervention()}
            ></Button>
          </Tooltip>
        )}

        <Tooltip
          title={
            isClosed
              ? "Esta intervenção não pode ser alterada, pois já possui desfecho cadastrado"
              : ""
          }
        >
          <Dropdown.Button
            loading={isSaving}
            disabled={isClosed}
            type="primary"
            onClick={() => handleSubmit()}
            menu={{
              items: saveItems,
              onClick: onMenuClick,
            }}
          >
            {t("interventionForm.btnSave")}
          </Dropdown.Button>
        </Tooltip>
      </FooterContainer>
    );
  };

  return (
    <Formik
      enableReinitialize
      onSubmit={onSave}
      initialValues={initialValues}
      validationSchema={validationSchema}
    >
      {({ handleSubmit, setFieldValue }) => (
        <DefaultModal
          open={!isEmpty(item)}
          width={700}
          centered
          destroyOnClose
          onCancel={onCancel}
          footer={
            <InterventionFooter
              handleSubmit={handleSubmit}
              setFieldValue={setFieldValue}
            />
          }
          {...props}
        >
          <header>
            <Heading $margin="0 0 11px">
              {item.idPrescriptionDrugList
                ? t("interventionForm.titleMultiple")
                : t("interventionForm.title")}
            </Heading>
          </header>
          {item.idPrescriptionDrugList ? (
            <FormHeader>
              <Row type="flex" gutter={24} css="padding: 2px 0">
                <Col span={24}>
                  <Heading as="p" $size="14px">
                    {item.idPrescriptionDrugList.length} itens selecionados
                  </Heading>
                </Col>
              </Row>
            </FormHeader>
          ) : (
            <>
              {item.idPrescriptionDrug + "" === "0" && (
                <PatientData item={item} />
              )}
              {item.idPrescriptionDrug + "" !== "0" && <DrugData item={item} />}
            </>
          )}

          <form onSubmit={handleSubmit}>
            <Row type="flex" gutter={[16, 16]}>
              <Base
                drugData={item}
                fetchDrugSummary={fetchDrugSummary}
                drugSummary={drugSummary}
                intervention={intervention}
                reasons={reasons}
                searchDrugs={searchDrugs}
                drugs={drugs}
                reasonTextMemory={reasonTextMemory}
                memorySaveReasonText={memorySaveReasonText}
                memoryFetchReasonText={memoryFetchReasonText}
                securityService={securityService}
                featureService={featureService}
                prescriptionStatus={prescriptionStatus}
                prescriptionHeaders={prescriptionHeaders}
              />
            </Row>
          </form>
        </DefaultModal>
      )}
    </Formik>
  );
}
