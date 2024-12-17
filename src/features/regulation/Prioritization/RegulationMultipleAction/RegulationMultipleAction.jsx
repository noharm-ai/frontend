import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Formik } from "formik";
import * as Yup from "yup";

import Heading from "components/Heading";
import DefaultModal from "components/Modal";
import notification from "components/notification";
import { getErrorMessage } from "utils/errorHandler";
import RegulationActionModel from "models/regulation/RegulationAction";
import {
  setMultipleActionModal,
  moveRegulationMultiple,
} from "../PrioritizationSlice";
import Form from "features/regulation/Regulation/RegulationAction/Form/Form";

export default function RegulationMultipleAction() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const selectedRegulations = useSelector(
    (state) => state.regulation.prioritization.multipleAction.list
  );
  const open = useSelector(
    (state) => state.regulation.prioritization.multipleAction.open
  );
  const status = useSelector(
    (state) => state.regulation.prioritization.multipleAction.status
  );
  const [validationSchema, setValidationSchema] = useState(
    Yup.object().shape({
      ids: Yup.number().nullable().required(t("validation.requiredField")),
      action: Yup.string().nullable().required(t("validation.requiredField")),
      nextStage: Yup.string()
        .nullable()
        .required(t("validation.requiredField")),
    })
  );

  const initialValues = {
    ids: selectedRegulations.map((r) => r.id),
    action: null,
    actionData: {},
  };

  const onSave = (params) => {
    const payload = {
      ...params,
      actionDataTemplate: RegulationActionModel.getForm(params.action, t),
    };

    dispatch(moveRegulationMultiple(payload)).then((response) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        notification.success({
          message: "Ação aplicada com sucesso!",
        });

        onCancel();
      }
    });
  };

  const onCancel = () => {
    dispatch(setMultipleActionModal(false));
  };

  return (
    <Formik
      enableReinitialize
      onSubmit={onSave}
      initialValues={initialValues}
      validationSchema={validationSchema}
      validateOnChange={false}
      validateOnBlur={false}
    >
      {({ handleSubmit }) => (
        <DefaultModal
          open={open}
          width={600}
          centered
          onCancel={onCancel}
          onOk={handleSubmit}
          confirmLoading={status === "loading"}
          destroyOnClose
          maskClosable={false}
          okText={t("actions.save")}
          cancelText={t("actions.cancel")}
          okButtonProps={{
            disabled: status === "loading",
          }}
          cancelButtonProps={{
            disabled: status === "loading",
          }}
        >
          <header
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <Heading size="18px">Ação Múltipla</Heading>
          </header>

          <Form
            setValidationSchema={setValidationSchema}
            validationSchema={validationSchema}
          />
        </DefaultModal>
      )}
    </Formik>
  );
}
