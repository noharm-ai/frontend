import React from "react";
import { useTranslation } from "react-i18next";
import { useFormikContext } from "formik";

import { Select } from "components/Inputs";
import RegulationStage from "models/regulation/RegulationStage";
import RegulationAction from "models/regulation/RegulationAction";
import { Form as FormElement } from "styles/Form.style";
import Field from "components/Forms/CustomForm/Field";

export default function Form() {
  const { t } = useTranslation();
  const { values, errors, setFieldValue } = useFormikContext();

  const onActionChange = (action) => {
    setFieldValue("action", action);
    setFieldValue("actionData", {});
  };

  return (
    <FormElement>
      <div className={`form-row ${errors.stage ? "error" : ""}`}>
        <div className="form-label">
          <label>Etapa atual:</label>
        </div>
        <div className="form-input">
          <Select
            onChange={(value) => setFieldValue("stage", value)}
            value={values.stage}
            status={errors.stage ? "error" : null}
            disabled
          >
            {RegulationStage.getStages(t).map((s) => (
              <Select.Option key={s.id} value={s.id}>
                {s.label}
              </Select.Option>
            ))}
          </Select>
        </div>
        {errors.stage && <div className="form-error">{errors.stage}</div>}
      </div>

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
        <>
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
              </div>
            </div>
          ))}
        </>
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
