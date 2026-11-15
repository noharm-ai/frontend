import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button, Select, Space } from "antd";
import { WarningOutlined } from "@ant-design/icons";
import { Formik } from "formik";
import styled from "styled-components";

import DefaultModal from "components/Modal";
import { Checkbox, Input, InputNumber } from "components/Inputs";
import { KnowledgeBaseIcon } from "features/knowledgeBase/KnowledgeBaseIcon/KnowledgeBaseIcon";

import {
  IExamTriggerExam,
  IExamTriggerResult,
  IExamTriggerRule,
} from "../InfectionControlSlice";
import { describeCurrentResult } from "../examTriggers";
import {
  getValidationSchema,
  IExamTriggerFormFields,
  OPERATORS,
  toFormFields,
} from "./examTriggerFields";

interface ExamTriggerFormProps {
  open: boolean;
  // the rule edited, null for a new one
  rule: IExamTriggerRule | null;
  exams: IExamTriggerExam[];
  // the patient's current result of each exam, by its reference
  current: Record<string, IExamTriggerResult | null>;
  saving: boolean;
  onSave: (fields: IExamTriggerFormFields) => void;
  onCancel: () => void;
}

const FormBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  .form-header {
    align-items: center;
    display: flex;
    gap: 8px;
    /* room for the close button */
    padding-right: 32px;

    .modal-title {
      margin: 0;
    }
  }

  .form-conditions {
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px;
  }

  .form-optional {
    color: #8c8c8c;
    font-weight: 400;
  }

  .form-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .form-label {
    font-weight: 500;
  }

  .form-hint {
    color: #8c8c8c;
    font-size: 12px;
  }

  .form-error {
    color: #ff4d4f;
    font-size: 12px;
  }

  .form-warning {
    color: #d46b08;
    font-size: 12px;
  }

  .form-condition {
    display: flex;
    gap: 8px;

    .ant-select {
      flex: 0 0 72px;
    }
  }

  .form-footer {
    display: flex;
    justify-content: flex-end;
  }
`;

// the selects are antd's own: the form opens over the review modal, and the
// shared Select (antd/lib) misses the z-index the stacked modal gets, its
// dropdown falling behind the form

/**
 * A rule of the exam triggers, new or edited: its name, the exam it watches
 * and its conditions - on the value and on the variation from the result at
 * review time - from which day of the treatment, and whether a drug evaluated
 * for the first time starts with it on
 */
export function ExamTriggerForm({
  open,
  rule,
  exams,
  current,
  saving,
  onSave,
  onCancel,
}: ExamTriggerFormProps) {
  const { t } = useTranslation();
  const validationSchema = useMemo(() => getValidationSchema(t), [t]);
  const operatorOptions = OPERATORS.map((option) => ({
    value: option.value,
    label: option.label,
  }));

  return (
    <DefaultModal
      open={open}
      width={520}
      centered
      destroyOnHidden
      onCancel={onCancel}
      footer={null}
    >
      <Formik
        key={rule?.id ?? "new"}
        initialValues={toFormFields(rule)}
        validationSchema={validationSchema}
        onSubmit={onSave}
        validateOnChange={false}
        validateOnBlur={false}
      >
        {({ values, errors, setFieldValue, submitForm }) => {
          const exam = exams.find((item) => item.examRef === values.examRef);

          return (
            <FormBody
              data-kb="infectionControl.examTriggers.form"
              data-testid="exam-trigger-form"
            >
              <header className="form-header">
                <h2 className="modal-title">
                  {t(
                    rule
                      ? "infectionControl.examTriggers.settings.edit"
                      : "infectionControl.examTriggers.settings.add",
                  )}
                </h2>
                <KnowledgeBaseIcon
                  anchor="infectionControl.examTriggers.form.articles"
                  label="Regra de gatilho de exame"
                />
              </header>

              <div className="form-field">
                <label className="form-label" htmlFor="exam-trigger-name">
                  {t("infectionControl.examTriggers.settings.name")}
                </label>
                <Input
                  id="exam-trigger-name"
                  maxLength={100}
                  value={values.name}
                  onChange={(e: any) => setFieldValue("name", e.target.value)}
                />
                {errors.name && (
                  <span className="form-error">{errors.name}</span>
                )}
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="exam-trigger-exam">
                  {t("infectionControl.examTriggers.settings.exam")}
                </label>
                <Select
                  id="exam-trigger-exam"
                  style={{ width: "100%" }}
                  value={values.examRef}
                  onChange={(value: any) => setFieldValue("examRef", value)}
                  placeholder={t(
                    "infectionControl.examTriggers.settings.examPlaceholder",
                  )}
                  options={exams.map((item) => ({
                    value: item.examRef,
                    label: item.available
                      ? item.name
                      : `${item.name} (${t("infectionControl.examTriggers.settings.notConfigured")})`,
                  }))}
                />
                {errors.examRef && (
                  <span className="form-error">{errors.examRef}</span>
                )}
                {exam && !exam.available && (
                  <span
                    className="form-warning"
                    data-testid="exam-trigger-form-unavailable"
                  >
                    <WarningOutlined />{" "}
                    {t("infectionControl.examTriggers.unavailable", {
                      exam: exam.name,
                    })}
                  </span>
                )}
                {exam?.available && exam.examRef in current && (
                  <span
                    className="form-hint"
                    data-testid="exam-trigger-form-current"
                  >
                    {describeCurrentResult(current[exam.examRef], t)}
                  </span>
                )}
              </div>

              <div
                className="form-conditions"
                data-kb="infectionControl.examTriggers.form.conditions"
                data-testid="exam-trigger-conditions"
              >
                <div className="form-field">
                  <span className="form-label">
                    {t("infectionControl.examTriggers.settings.conditions")}
                  </span>
                  <span className="form-hint">
                    {t("infectionControl.examTriggers.settings.conditionsHint")}
                  </span>
                </div>

                <div className="form-field">
                  <span className="form-label">
                    {t("infectionControl.examTriggers.settings.value")}
                  </span>
                  <div
                    className="form-condition"
                    data-testid="exam-trigger-value"
                  >
                    <Select
                      id="exam-trigger-value-operator"
                      aria-label={t(
                        "infectionControl.examTriggers.settings.valueOperator",
                      )}
                      value={values.valueOperator}
                      onChange={(value: any) =>
                        setFieldValue("valueOperator", value)
                      }
                      options={operatorOptions}
                    />
                    <InputNumber
                      aria-label={t(
                        "infectionControl.examTriggers.settings.value",
                      )}
                      decimalSeparator=","
                      value={values.value}
                      onChange={(value: number | null) =>
                        setFieldValue("value", value ?? null)
                      }
                    />
                  </div>
                </div>

                <div className="form-field">
                  <span className="form-label">
                    {t("infectionControl.examTriggers.settings.variation")}
                  </span>
                  <div
                    className="form-condition"
                    data-testid="exam-trigger-variation"
                  >
                    <Select
                      id="exam-trigger-variation-operator"
                      aria-label={t(
                        "infectionControl.examTriggers.settings.variationOperator",
                      )}
                      value={values.variationOperator}
                      onChange={(value: any) =>
                        setFieldValue("variationOperator", value)
                      }
                      options={operatorOptions}
                    />
                    <InputNumber
                      aria-label={t(
                        "infectionControl.examTriggers.settings.variation",
                      )}
                      decimalSeparator=","
                      suffix="%"
                      value={values.variation}
                      onChange={(value: number | null) =>
                        setFieldValue("variation", value ?? null)
                      }
                    />
                  </div>
                  <span className="form-hint">
                    {t("infectionControl.examTriggers.settings.variationHint")}
                  </span>
                </div>

                {errors.value && (
                  <span className="form-error">{errors.value}</span>
                )}
              </div>

              <div className="form-field">
                <label
                  className="form-label"
                  htmlFor="exam-trigger-from-course-day"
                >
                  {t("infectionControl.examTriggers.settings.fromCourseDay")}{" "}
                  <span className="form-optional">
                    ({t("infectionControl.examTriggers.settings.optional")})
                  </span>
                </label>
                <InputNumber
                  id="exam-trigger-from-course-day"
                  min={1}
                  precision={0}
                  value={values.fromCourseDay}
                  onChange={(value: number | null) =>
                    setFieldValue("fromCourseDay", value ?? null)
                  }
                />
                <span className="form-hint">
                  {t(
                    "infectionControl.examTriggers.settings.fromCourseDayHint",
                  )}
                </span>
                {errors.fromCourseDay && (
                  <span className="form-error">{errors.fromCourseDay}</span>
                )}
              </div>

              <Checkbox
                checked={values.enabledByDefault}
                onChange={(e: any) =>
                  setFieldValue("enabledByDefault", e.target.checked)
                }
              >
                {t("infectionControl.examTriggers.settings.enabledByDefault")}
              </Checkbox>

              <div className="form-footer">
                <Space>
                  <Button onClick={onCancel} disabled={saving}>
                    {t("infectionControl.examTriggers.settings.cancel")}
                  </Button>
                  <Button type="primary" loading={saving} onClick={submitForm}>
                    {t("infectionControl.examTriggers.settings.save")}
                  </Button>
                </Space>
              </div>
            </FormBody>
          );
        }}
      </Formik>
    </DefaultModal>
  );
}
