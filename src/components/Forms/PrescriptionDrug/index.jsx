import React from "react";
import { isEmpty } from "lodash";
import { Formik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";

import { Row } from "components/Grid";
import Button from "components/Button";
import notification from "components/notification";
import Heading from "components/Heading";
import DefaultModal from "components/Modal";
import { getErrorMessageFromException } from "utils/errorHandler";

import Base from "./Base";
import BaseNotes from "./BaseNotes";
import BaseCopy from "./BaseCopy";

export default function PrescriptionDrug({
  item,
  isSaving,
  save,
  saveNotes,
  copy,
  suspend,
  select,
  searchDrugs,
  fetchDrugSummary,
  drugs,
  drugSummary,
  admissionNumber,
}) {
  const { t } = useTranslation();

  let validationSchema;

  if (item.updateDrug) {
    validationSchema = Yup.object().shape({
      idDrug: Yup.number().nullable().required(t("validation.requiredField")),
    });
  }

  if (item.copyDrugs) {
    validationSchema = Yup.object().shape({
      selectedDrugs: Yup.array().min(1, t("validation.requiredField")),
    });
  }

  if (isEmpty(item)) {
    return null;
  }

  const onCancel = () => {
    select({});
  };

  const onSave = (params) => {
    if (item.updateDrug) {
      save(item.idPrescriptionDrug, item.aggId, item.source, params)
        .then(() => {
          select({});

          notification.success({
            message: t("success.generic"),
          });
        })
        .catch((error) => {
          console.error(error);
          notification.error({
            message: t("error.title"),
            description: getErrorMessageFromException(error, t),
          });
        });
    }

    if (item.updateNotes) {
      saveNotes(item.idPrescriptionDrug, item.source, params)
        .then(() => {
          select({});

          notification.success({
            message: t("success.generic"),
          });
        })
        .catch((err) => {
          console.error(err);
          notification.error({
            message: t("error.title"),
            description: getErrorMessageFromException(err, t),
          });
        });
    }

    if (item.copyDrugs) {
      copy(item.idPrescription, item.aggId, params.selectedDrugs)
        .then(() => {
          select({});

          notification.success({
            message: t("success.generic"),
          });
        })
        .catch((error) => {
          console.error(error);
          notification.error({
            message: t("error.title"),
            description: t("error.description"),
          });
        });
    }
  };

  const onSuspend = (suspension) => {
    suspend(item.idPrescriptionDrug, item.source, suspension);
  };

  const Footer = ({ handleSubmit }) => {
    const hasSuspendAction = item.updateDrug && item.idPrescriptionDrug;

    return (
      <>
        <Button
          onClick={() => onCancel()}
          disabled={isSaving}
          className="gtm-bt-cancel-drugEdit"
        >
          {t("interventionForm.btnCancel")}
        </Button>

        {hasSuspendAction && !item.suspended && (
          <Button
            onClick={() => onSuspend(true)}
            disabled={isSaving}
            className="gtm-bt-suspend-drugEdit"
            type="danger"
            ghost
          >
            {t("prescriptionDrugForm.btnSuspend")}
          </Button>
        )}

        {hasSuspendAction && item.suspended && (
          <Button
            onClick={() => onSuspend(false)}
            disabled={isSaving}
            className="gtm-bt-removeSuspension-drugEdit"
          >
            {t("prescriptionDrugForm.btnRemoveSuspension")}
          </Button>
        )}

        <Button
          type="primary"
          className="gtm-bt-save-drugEdit"
          onClick={() => handleSubmit()}
          loading={isSaving}
        >
          {t("interventionForm.btnSave")}
        </Button>
      </>
    );
  };

  const initialValues = {
    idPrescription: item.idPrescription,
    idPrescriptionDrug: item.idPrescriptionDrug,
    idDrug: item.idDrug,
    drug: item.drug,
    idSegment: item.idSegment,
    dose: item.dose,
    measureUnit: item.measureUnit ? item.measureUnit.value : null,
    measureUnitLabel: item.measureUnit ? item.measureUnit.label : null,
    frequency: item.frequency ? item.frequency.value : null,
    frequencyLabel: item.frequency ? item.frequency.label : null,
    interval: item.interval,
    route: item.route,
    notes: item.notes !== null ? item.notes : item.prevNotes,
    admissionNumber: admissionNumber || item.admissionNumber,
    idHospital: item.idHospital,
    recommendation: item.recommendation,
    selectedDrugs: [],
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
          open={!isEmpty(item)}
          width={700}
          centered
          destroyOnClose
          onCancel={onCancel}
          footer={<Footer handleSubmit={handleSubmit} />}
        >
          <header>
            <Heading $margin="0 0 15px">
              {item.updateDrug &&
                t(
                  `prescriptionDrugForm.title${
                    initialValues.idPrescriptionDrug ? "Edit" : "Create"
                  }`
                )}
              {item.updateNotes && t("prescriptionDrugForm.titleNotes")}
              {item.copyDrugs && t("prescriptionDrugForm.titleCopy")}
            </Heading>
          </header>
          <form onSubmit={handleSubmit}>
            <Row type="flex" gutter={[16, 16]}>
              {item.updateDrug && (
                <Base
                  item={item}
                  fetchDrugSummary={fetchDrugSummary}
                  searchDrugs={searchDrugs}
                  drugs={drugs}
                  drugSummary={drugSummary}
                />
              )}

              {item.updateNotes && <BaseNotes item={item} />}

              {item.copyDrugs && <BaseCopy item={item} />}
            </Row>
          </form>
        </DefaultModal>
      )}
    </Formik>
  );
}
