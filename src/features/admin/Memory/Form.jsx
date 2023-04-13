import React from "react";
import { useDispatch } from "react-redux";
import { Formik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";

import { Textarea } from "components/Inputs";
import notification from "components/notification";
import Button from "components/Button";
import { Form } from "styles/Form.style";

import { updateMemory } from "./MemorySlice";

function MemoryForm({ memory }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const validationSchema = Yup.object().shape({
    value: Yup.string().nullable().required(t("validation.requiredField")),
  });
  const initialValues = {
    key: memory?.key,
    kind: memory?.kind,
    value: memory ? JSON.stringify(memory.value) : "",
  };

  const onSave = (params) => {
    const values = { ...params };
    try {
      values.value = JSON.parse(params.value);
    } catch {
      notification.error({ message: "JSON inválido" });
      return;
    }

    dispatch(updateMemory(values)).then((response) => {
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
      {({ handleSubmit, errors, touched, setFieldValue, values }) => (
        <>
          <Form onSubmit={handleSubmit}>
            <div
              className={`form-row ${
                errors.value && touched.value ? "error" : ""
              }`}
            >
              <div className="form-input">
                <Textarea
                  value={values.value}
                  onChange={({ target }) =>
                    setFieldValue("value", target.value)
                  }
                ></Textarea>
              </div>
              {errors.value && touched.value && (
                <div className="form-error">{errors.value}</div>
              )}
            </div>
          </Form>
          <div className="actions">
            <Button type="primary" onClick={handleSubmit}>
              Salvar
            </Button>
          </div>
        </>
      )}
    </Formik>
  );
}

export default MemoryForm;
