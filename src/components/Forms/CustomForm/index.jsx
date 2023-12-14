import React from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const initialValues = {};
  const validationShape = {};

  if (template) {
    template.forEach((group) => {
      group.questions.forEach((question) => {
        if (values) {
          if (values[question.id] !== null) {
            if (question.type === "json") {
              try {
                initialValues[question.id] = JSON.stringify(
                  values[question.id],
                  null,
                  2
                );
              } catch (e) {
                initialValues[question.id] = values[question.id];
              }
            } else {
              initialValues[question.id] = values[question.id];
            }
          } else {
            initialValues[question.id] =
              question.type === "options-multiple" ? [] : null;
          }
        } else {
          initialValues[question.id] =
            question.type === "options-multiple" ? [] : null;
        }

        if (question.required) {
          if (
            [
              "options-multiple",
              "memory-multiple",
              "options-key-value-multiple",
            ].indexOf(question.type) !== -1
          ) {
            validationShape[question.id] = Yup.array()
              .nullable()
              .min(1, t("validation.atLeastOne"))
              .required(t("validation.requiredField"));
          } else if (question.type === "json") {
            validationShape[question.id] = Yup.string().test(
              "json",
              "JSON Inválido",
              (value) => {
                try {
                  JSON.parse(value);
                  return true;
                } catch (error) {
                  return false;
                }
              }
            );
          } else {
            validationShape[question.id] = Yup.string()
              .nullable()
              .required(t("validation.requiredField"));
          }
        }
      });
    });
  }

  const validationSchema = Yup.object().shape(validationShape);

  const submit = (values) => {
    const preparedValues = {};
    template.forEach((group) => {
      group.questions.forEach((question) => {
        if (question.type === "json") {
          try {
            console.log("parse json", JSON.parse(values[question.id]));
            preparedValues[question.id] = JSON.parse(values[question.id]);
          } catch (e) {
            preparedValues[question.id] = null;
          }
        } else {
          preparedValues[question.id] = values[question.id];
        }
      });
    });

    console.log("values", preparedValues);

    onSubmit({
      values: preparedValues,
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
