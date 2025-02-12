import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Formik } from "formik";
import { useTranslation } from "react-i18next";

import notification from "components/notification";
import Heading from "components/Heading";
import DefaultModal from "components/Modal";
import { getErrorMessage } from "utils/errorHandler";
import { setMeasureUnit, updateMeasureUnit } from "../MeasureUnitSlice";
import { BaseForm } from "./Base";

import { Form } from "styles/Form.style";

export function MeasureUnitForm({ ...props }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const formData = useSelector((state) => state.admin.measureUnit.single.data);
  const status = useSelector((state) => state.admin.measureUnit.single.status);
  const isSaving = status === "loading";

  const initialValues = {
    ...formData,
  };

  const onSave = (params) => {
    dispatch(updateMeasureUnit(params)).then((response) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        dispatch(setMeasureUnit(null));

        notification.success({
          message: t("success.generic"),
        });
      }
    });
  };

  const onCancel = () => {
    dispatch(setMeasureUnit(null));
  };

  return (
    <Formik enableReinitialize onSubmit={onSave} initialValues={initialValues}>
      {({ handleSubmit }) => (
        <DefaultModal
          open={formData}
          width={350}
          centered
          destroyOnClose
          onCancel={onCancel}
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
            <Heading $margin="0 0 11px">{formData?.name}</Heading>
          </header>

          <Form onSubmit={handleSubmit}>
            <BaseForm open={formData} />
          </Form>
        </DefaultModal>
      )}
    </Formik>
  );
}
