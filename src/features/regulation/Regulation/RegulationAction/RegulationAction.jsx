import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Formik } from "formik";
import * as Yup from "yup";

import Heading from "components/Heading";
import DefaultModal from "components/Modal";
import Form from "./Form/Form";
import { setActionModal } from "../RegulationSlice";

export default function RegulationAction() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const data = useSelector((state) => state.regulation.regulation.data);
  const status = useSelector(
    (state) => state.regulation.regulation.action.status
  );
  const open = useSelector((state) => state.regulation.regulation.action.open);
  const [validationSchema, setValidationSchema] = useState(
    Yup.object().shape({
      id: Yup.number().nullable().required(t("validation.requiredField")),
      action: Yup.string().nullable().required(t("validation.requiredField")),
      nextStage: Yup.string()
        .nullable()
        .required(t("validation.requiredField")),
    })
  );

  const initialValues = {
    id: data.id,
    stage: data.stage,
    action: null,
    actionData: {},
  };

  const onSave = (params) => {
    console.log("save", params);
  };

  const onCancel = () => {
    dispatch(setActionModal(false));
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
            <Heading size="18px">Regulação nº: {data.id}</Heading>
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
