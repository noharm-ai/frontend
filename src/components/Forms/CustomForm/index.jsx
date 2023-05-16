import React from "react";
import { Formik } from "formik";
import * as Yup from "yup";

import Button from "components/Button";

import Base from "./Base";
import { CustomFormContainer } from "../Form.style";

export default function CustomForm({
  onSubmit,
  onCancel,
  template,
  isSaving,
  values,
  startClosed,
}) {
  const initialValues = {};
  const validationShape = {};

  if (template) {
    template.forEach((group) => {
      group.questions.forEach((question) => {
        if (values) {
          if (values[question.id] !== null) {
            initialValues[question.id] = values[question.id];
          } else {
            initialValues[question.id] =
              question.type === "options-multiple" ? [] : null;
          }
        } else {
          initialValues[question.id] =
            question.type === "options-multiple" ? [] : null;
        }

        if (question.required) {
          validationShape[question.id] = Yup.string()
            .nullable()
            .required("Campo obrigatório");
        }
      });
    });
  }

  const validationSchema = Yup.object().shape(validationShape);

  const submit = (values) => {
    onSubmit({
      values,
      template,
    });
  };

  if (!template) {
    return null;
  }

  return (
    <Formik
      enableReinitialize
      onSubmit={submit}
      initialValues={initialValues}
      validationSchema={validationSchema}
    >
      {({ handleSubmit }) => (
        <CustomFormContainer>
          <Base template={template} startClosed={startClosed} />

          <div className="actions">
            {onCancel && (
              <Button onClick={() => onCancel()} loading={isSaving}>
                Cancelar
              </Button>
            )}

            <Button
              onClick={() => handleSubmit()}
              type="primary"
              loading={isSaving}
            >
              Salvar
            </Button>
          </div>
        </CustomFormContainer>
      )}
    </Formik>
  );
}
