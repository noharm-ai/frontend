import React from "react";
import { useTranslation } from "react-i18next";
import { useFormikContext } from "formik";
import * as Yup from "yup";

import { Select } from "components/Inputs";
import RegulationStage from "models/regulation/RegulationStage";
import RegulationAction from "models/regulation/RegulationAction";
import { Form as FormElement } from "styles/Form.style";
import RegulationStageTag from "components/RegulationStageTag";
import Field from "components/Forms/CustomForm/Field";

export default function Form({ setValidationSchema }) {
  const { t } = useTranslation();
  const { values, errors, setFieldValue } = useFormikContext();

  const onActionChange = (action) => {
    setFieldValue("action", action);
    setFieldValue("actionData", {});

    const actionDataFields = {};
    RegulationAction.getForm(action, t).forEach((field) => {
      if (!field.required) {
        return;
      }

      if (field.type === "reg_type") {
        actionDataFields[field.id] = Yup.object()
          .nullable()
          .required(t("validation.requiredField"));
      } else {
        actionDataFields[field.id] = Yup.string()
          .nullable()
          .required(t("validation.requiredField"));
      }
    });

    const validation = Yup.object().shape({
      action: Yup.string().nullable().required(t("validation.requiredField")),
      nextStage: Yup.string()
        .nullable()
        .required(t("validation.requiredField")),
      actionData: Yup.object(actionDataFields),
    });

    setValidationSchema(validation);
  };

  return (
    <FormElement>
      {values.stage !== undefined && (
        <div className={`form-row`}>
          <div className="form-label">
            <label>Etapa atual:</label>
          </div>
          <div className="form-input">
            <RegulationStageTag stage={values.stage} />
          </div>
        </div>
      )}

      {values.ids && (
        <div className={`form-row`}>
          <div className="form-label">
            <label>Solicitações selecionadas:</label>
          </div>
          <div className="form-input">
            <Select value={values.ids} mode="multiple" maxTagCount="responsive">
              {values.ids.map((id) => (
                <Select.Option key={id} value={id}>
                  {id}
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>
      )}

      <div className={`form-row ${errors.action ? "error" : ""}`}>
        <div className="form-label">
          <label>Ação:</label>
        </div>
        <div className="form-input">
          <Select
            onChange={(value) => onActionChange(value)}
            value={values.action}
            status={errors.action ? "error" : null}
            optionFilterProp="children"
            showSearch
          >
            {RegulationAction.getActions(t).map((s) => (
              <Select.Option key={s.id} value={s.id}>
                {s.label}
              </Select.Option>
            ))}
          </Select>
        </div>
        {errors.action && <div className="form-error">{errors.action}</div>}
      </div>

      {values.action && (
        <div style={{ paddingLeft: "15px", paddingTop: "15px" }}>
          {RegulationAction.getForm(values.action, t).map((q) => (
            <div className={`form-row`} key={q.id}>
              <div className="form-label">
                <label>{q.label}:</label>
              </div>
              <div className="form-input">
                <Field
                  question={q}
                  values={values.actionData}
                  setFieldValue={(id, value) =>
                    setFieldValue(`actionData.${id}`, value)
                  }
                />
                {q.help && <div className="form-info">{q.help}</div>}
                {errors.actionData && errors.actionData[q.id] && (
                  <div className="form-error">{errors.actionData[q.id]}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={`form-row ${errors.nextStage ? "error" : ""}`}>
        <div className="form-label">
          <label>Próxima etapa:</label>
        </div>
        <div className="form-input">
          <Select
            onChange={(value) => setFieldValue("nextStage", value)}
            value={values.nextStage}
            status={errors.nextStage ? "error" : null}
            optionFilterProp="children"
            showSearch
          >
            {RegulationStage.getStages(t).map((s) => (
              <Select.Option key={s.id} value={s.id}>
                {s.label}
              </Select.Option>
            ))}
          </Select>
        </div>
        {errors.nextStage && (
          <div className="form-error">{errors.nextStage}</div>
        )}
      </div>
    </FormElement>
  );
}
