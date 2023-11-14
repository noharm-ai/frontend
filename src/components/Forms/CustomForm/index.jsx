import React from "react";
import { Formik } from "formik";
import * as Yup from "yup";

import Button from "components/Button";
import Collapse from "components/Collapse";

import Base from "./Base";
import { CustomFormContainer } from "../Form.style";

export default function CustomForm({
  onSubmit,
  onCancel,
  template,
  isSaving,
  values,
  startClosed,
  horizontal = false,
  onChange,
  btnSaveText,
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
          {template.length > 1 ? (
            <Collapse
              bordered
              defaultActiveKey={startClosed ? null : template[0].group}
              accordion
            >
              {template.map((item) => (
                <Collapse.Panel key={item.group} header={item.group}>
                  <Base
                    horizontal={horizontal}
                    item={item}
                    onChange={onChange}
                  />
                </Collapse.Panel>
              ))}
            </Collapse>
          ) : (
            <div className="single-panel">
              <Base
                horizontal={horizontal}
                item={template[0]}
                onChange={onChange}
              />
            </div>
          )}

          <div className={`actions ${horizontal ? "horizontal" : ""}`}>
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
              {btnSaveText || "Salvar"}
            </Button>
          </div>
        </CustomFormContainer>
      )}
    </Formik>
  );
}
