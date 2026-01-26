import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Formik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";

import notification from "components/notification";
import Heading from "components/Heading";
import DefaultModal from "components/Modal";
import { getErrorMessage } from "utils/errorHandler";
import { setIntegration, updateIntegration } from "../IntegrationConfigSlice";
import { setConfigThunk } from "store/ducks/app/thunk";
import Base from "./Base";

import { Form } from "styles/Form.style";

function IntegrationConfigForm({ ...props }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const formData = useSelector(
    (state) => state.admin.integrationConfig.single.data
  );
  const status = useSelector(
    (state) => state.admin.integrationConfig.single.status
  );
  const isSaving = status === "loading";

  const validationSchema = Yup.object().shape({
    schema: Yup.string().nullable().required(t("validation.requiredField")),
    status: Yup.string().nullable().required(t("validation.requiredField")),
    config: Yup.object().shape({
      getname: Yup.object().shape({
        type: Yup.string(),
        params: Yup.mixed().when("type", {
          is: (val) => {
            return val === "proxy";
          },
          then: Yup.object().nullable().required("JSON inválido"),
          otherwise: Yup.object().nullable(),
        }),
      }),
    }),
  });
  const initialValues = {
    ...formData,
    config: formData?.config ?? {},
  };

  const onSave = (params) => {
    const config = { ...params.config };
    const payload = { ...params, config };

    dispatch(updateIntegration(payload)).then((response) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        dispatch(setIntegration(null));

        if (params.schema === localStorage.getItem("schema")) {
          setConfigThunk({ integrationStatus: params.status })(dispatch);
        }

        notification.success({
          message: t("success.generic"),
        });
      }
    });
  };

  const onCancel = () => {
    dispatch(setIntegration(null));
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
            <Heading $margin="0 0 11px">{formData?.schema}</Heading>
          </header>

          <Form onSubmit={handleSubmit}>
            <Base />
          </Form>
        </DefaultModal>
      )}
    </Formik>
  );
}

export default IntegrationConfigForm;
