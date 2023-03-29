import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Formik } from "formik";
import * as Yup from "yup";

import notification from "components/notification";
import Heading from "components/Heading";
import DefaultModal from "components/Modal";

import { upsertDrugMeasureUnit, fetchUnits } from "./DrugMeasureUnitsSlice";
import { fetchDrugsUnitsListThunk } from "store/ducks/drugs/thunk";
import Base from "./Base";

import { Form } from "styles/Form.style";

function DrugMeasureUnitsForm({ visible, setVisible, ...props }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const selecteds = useSelector((state) => state.outliers.firstFilter);
  const status = useSelector((state) => state.drugMeasureUnits.status);
  const unitStatus = useSelector(
    (state) => state.drugMeasureUnits.units.status
  );
  const isSaving = status === "loading";

  const validationSchema = Yup.object().shape({
    factor: Yup.number().nullable().required(t("validation.requiredField")),
    idMeasureUnit: Yup.string()
      .nullable()
      .required(t("validation.requiredField")),
  });
  const initialValues = {
    idSegment: selecteds.idSegment,
    idDrug: selecteds.idDrug,
    idMeasureUnit: null,
    factor: null,
  };

  useEffect(() => {
    if (unitStatus === "idle" && visible) {
      dispatch(
        fetchUnits({ idDrug: selecteds.idDrug, idSegment: selecteds.idSegment })
      );
    }
  }, [unitStatus, dispatch, selecteds, visible]);

  if (unitStatus === "failed") {
    notification.error({
      message: t("error.title"),
      description: t("error.description"),
    });
  }

  const onSave = (params, formikBag) => {
    dispatch(upsertDrugMeasureUnit(params)).then((response) => {
      if (response.error) {
        if (response.payload?.code) {
          notification.error({
            message: t(response.payload.code),
          });
        } else if (response.payload?.message) {
          notification.error({
            message: response.payload.message,
          });
        } else {
          notification.error({
            message: t("errors.generic"),
          });
        }
        console.error(response);
      } else {
        setVisible(false);
        formikBag.resetForm();

        dispatch(
          fetchDrugsUnitsListThunk({
            idSegment: selecteds.idSegment,
            id: selecteds.idDrug,
          })
        );

        notification.success({
          message: t("success.generic"),
        });
      }
    });
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
          visible={visible}
          width={400}
          centered
          destroyOnClose
          onCancel={() => setVisible(false)}
          onOk={handleSubmit}
          okText={t("actions.save")}
          cancelText={t("actions.cancel")}
          confirmLoading={isSaving}
          okButtonProps={{
            disabled: isSaving,
          }}
          cancelButtonProps={{
            disabled: isSaving,
          }}
          {...props}
        >
          <header>
            <Heading margin="0 0 11px" size="18px">
              {t("titles.addDrugMeasureUnit")}
            </Heading>
          </header>

          <Form onSubmit={handleSubmit}>
            <Base />
          </Form>
        </DefaultModal>
      )}
    </Formik>
  );
}

export default DrugMeasureUnitsForm;
