import React, { useEffect } from "react";
import isEmpty from "lodash.isempty";
import { Formik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { RollbackOutlined } from "@ant-design/icons";

import { Row } from "components/Grid";
import Button from "components/Button";
import Tooltip from "components/Tooltip";
import notification from "components/notification";
import Heading from "components/Heading";
import DefaultModal from "components/Modal";
import InterventionReasonRelationType from "models/InterventionReasonRelationType";

import Base from "./Base";
import PatientData from "./PatientData";
import DrugData from "./DrugData";

export default function Intervention({
  intervention,
  reasons,
  updateInterventionData,
  reset,
  error,
  save,
  select,
  savePrescriptionDrugStatus,
  checkPrescriptionDrug,
  setVisibility,
  afterSaveIntervention,
  disableUndoIntervention,
  open,
  fetchReasonsList,
  searchDrugs,
  drugs,
  reasonTextMemory,
  memorySaveReasonText,
  memoryFetchReasonText,
  drugSummary,
  fetchDrugSummary,
  security,
  ...props
}) {
  const { t } = useTranslation();
  const { isSaving, wasSaved, item } = intervention;

  const validationSchema = Yup.object().shape({
    idInterventionReason: Yup.array()
      .nullable()
      .min(1, t("validation.atLeastOne"))
      .required(t("validation.requiredField")),
    interactions: Yup.array()
      .nullable()
      .when("idInterventionReason", {
        is: (selectedReasons) => {
          if (isEmpty(selectedReasons)) return false;

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

  // handle after save intervention.
  useEffect(() => {
    if (wasSaved && open) {
      reset();
      setVisibility(false);

      notification.success({
        message: t("success.intervention"),
      });
    }
  }, [wasSaved, reset, item, updateInterventionData, setVisibility, open]); // eslint-disable-line

  useEffect(() => {
    if (checkPrescriptionDrug && checkPrescriptionDrug.success) {
      setVisibility(false);
    }
  }, [checkPrescriptionDrug, setVisibility]);

  // show message if has error
  useEffect(() => {
    if (!isEmpty(error)) {
      notification.error({
        message: t("error.title"),
        description: t("error.description"),
      });
    }
  }, [error, t]);

  useEffect(() => {
    if (open) {
      fetchReasonsList();
    }
  }, [fetchReasonsList, open]);

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
    idDrug: item.idDrug,
    idDrugLabel: item.drug,
    interval: item.interval,
    intervalLabel: item.time,
  };
  const initialValues = {
    idPrescription: item.idPrescription,
    idPrescriptionDrug: item.idPrescriptionDrug,
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
    transcriptionData: {
      ...transcriptable,
    },
  };

  if (item.intervention.transcription) {
    initialValues.transcriptionData = {
      ...initialValues.transcriptionData,
      ...item.intervention.transcription,
    };
  }

  const onCancel = () => {
    select({});
    setVisibility(false);
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
      transcription: transcription
        ? getTranscriptionData(transcriptionData)
        : null,
    };

    delete interventionData.transcriptionData;

    save(interventionData)
      .then((response) => {
        console.log("response", response);

        // if (afterSaveIntervention) {
        //   afterSaveIntervention(interventionData);
        // } else {
        //   updateInterventionData(item.idPrescriptionDrug, item.source, {
        //     ...interventionData,
        //     status: "s",
        //   });
        // }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const InterventionFooter = ({ handleSubmit }) => {
    const isChecked = item.intervention && item.intervention.status === "s";

    const undoIntervention = () => {
      const source = item.idPrescriptionDrug === 0 ? "patient" : item.source;
      savePrescriptionDrugStatus(
        item.idPrescriptionDrug,
        item.idPrescription,
        "0",
        source
      );
    };

    return (
      <>
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
              type="danger gtm-bt-undo-interv"
              icon={<RollbackOutlined style={{ fontSize: 16 }} />}
              ghost
              loading={
                checkPrescriptionDrug && checkPrescriptionDrug.isChecking
              }
              onClick={() => undoIntervention()}
            ></Button>
          </Tooltip>
        )}

        <Button
          type="primary gtm-bt-save-interv"
          onClick={() => handleSubmit()}
          loading={isSaving}
        >
          {t("interventionForm.btnSave")}
        </Button>
      </>
    );
  };

  return (
    <Formik
      enableReinitialize
      onSubmit={onSave}
      initialValues={initialValues}
      validationSchema={validationSchema}
    >
      {({ handleSubmit }) => (
        <DefaultModal
          open={open}
          width={700}
          centered
          destroyOnClose
          onCancel={onCancel}
          footer={<InterventionFooter handleSubmit={handleSubmit} />}
          {...props}
        >
          <header>
            <Heading margin="0 0 11px">{t("interventionForm.title")}</Heading>
          </header>
          {(item.intervention.id + "" === "0" ||
            item.intervention.idPrescriptionDrug + "" === "0") && (
            <PatientData {...item} />
          )}
          {item.intervention.id + "" !== "0" &&
            item.intervention.idPrescriptionDrug + "" !== "0" && (
              <DrugData {...item} />
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
                security={security}
              />
            </Row>
          </form>
        </DefaultModal>
      )}
    </Formik>
  );
}
