import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Formik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { Spin } from "antd";

import notification from "components/notification";
import Heading from "components/Heading";
import DefaultModal from "components/Modal";
import { getErrorMessage } from "utils/errorHandler";

import { Form } from "styles/Form.style";

import { setSubstance, upsertSubstance } from "../SubstanceFormSlice";
import Base from "./Base";

export default function SubstanceForm({ ...props }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const formData = useSelector((state) => state.admin.substanceForm.data);
  const status = useSelector((state) => state.admin.substanceForm.status);
  const fetchStatus = useSelector(
    (state) => state.admin.substanceForm.fetchStatus
  );
  const isSaving = status === "loading";
  const isFetching = fetchStatus === "loading";

  const validationSchema = Yup.object().shape({
    name: Yup.string().nullable().required(t("validation.requiredField")),
  });
  const initialValues = {
    ...formData,
  };

  const onSave = (params) => {
    dispatch(upsertSubstance(params)).then((response) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        dispatch(setSubstance(null));

        notification.success({
          message: t("success.generic"),
        });
      }
    });
  };

  const onCancel = () => {
    dispatch(setSubstance(null));
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
          open={formData}
          width={700}
          centered
          destroyOnHidden
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
            <Heading
              style={{
                fontSize: "16px",
                lineHeight: "1.3rem",
                paddingRight: "1rem",
              }}
            >
              {formData?.name}
            </Heading>
          </header>

          <Form onSubmit={handleSubmit}>
            <Spin spinning={isFetching}>
              <Base open={formData} />
            </Spin>
          </Form>
        </DefaultModal>
      )}
    </Formik>
  );
}
