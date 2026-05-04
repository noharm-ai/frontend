import React, { useEffect } from "react";
import { Formik, useFormikContext } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";

import Button from "components/Button";
import Collapse from "components/Collapse";
import RichTextView from "src/components/RichTextView";

import Base from "./Base";
import { CustomFormContainer, GroupProgressBadge } from "../Form.style";

function FormikObserver({ onValuesChange }) {
  const { values } = useFormikContext();
  useEffect(() => {
    if (onValuesChange) onValuesChange(values);
  }, [values, onValuesChange]);
  return null;
}

export default function CustomForm({
  onSubmit,
  onCancel,
  template,
  isSaving,
  values,
  startClosed,
  horizontal = false,
  onChange,
  onValuesChange,
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
                  2,
                );
              } catch {
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
                } catch {
                  return false;
                }
              },
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
            preparedValues[question.id] = JSON.parse(values[question.id]);
          } catch {
            preparedValues[question.id] = null;
          }
        } else {
          preparedValues[question.id] = values[question.id];
        }
      });
    });

    onSubmit({
      values: preparedValues,
      template,
    });
  };

  const getGroupProgress = (group, formValues) => {
    const countable = group.questions.filter(
      (q) => q.type !== "calculated_field"
    );
    const answered = countable.filter((q) => {
      const v = formValues[q.id];
      if (v === null || v === undefined) return false;
      if (typeof v === "string" && v.trim() === "") return false;
      if (Array.isArray(v) && v.length === 0) return false;
      return true;
    });
    return { answered: answered.length, total: countable.length };
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
      {({ handleSubmit, values }) => (
        <CustomFormContainer>
          <FormikObserver onValuesChange={onValuesChange} />
          {template.length > 1 ? (
            <Collapse
              bordered
              defaultActiveKey={startClosed ? null : template[0].group}
              accordion
            >
              {template.map((item) => {
                const { answered, total } = getGroupProgress(item, values);
                return (
                <Collapse.Panel
                  key={item.group}
                  header={
                    <span style={{ display: "flex", alignItems: "center" }}>
                      {item.group}
                      <GroupProgressBadge $complete={answered === total}>
                        {answered}/{total}
                      </GroupProgressBadge>
                    </span>
                  }
                >
                  {item.description && <RichTextView text={item.description} />}
                  <Base
                    horizontal={horizontal}
                    item={item}
                    onChange={onChange}
                  />
                </Collapse.Panel>
                );
              })}
            </Collapse>
          ) : (
            <div className="single-panel">
              {template[0].description && (
                <RichTextView text={template[0].description} />
              )}
              {(() => {
                const { answered, total } = getGroupProgress(template[0], values);
                return (
                  <div style={{ marginBottom: 12, textAlign: "right" }}>
                    <GroupProgressBadge $complete={answered === total}>
                      {answered}/{total}
                    </GroupProgressBadge>
                  </div>
                );
              })()}
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
