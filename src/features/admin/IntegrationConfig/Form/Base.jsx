import React from "react";
import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";

import { Select } from "components/Inputs";

function BaseForm() {
  const { t } = useTranslation();
  const { values, errors, touched, setFieldValue } = useFormikContext();

  return (
    <>
      <div
        className={`form-row ${errors.status && touched.status ? "error" : ""}`}
      >
        <div className="form-label">
          <label>{t("labels.status")}:</label>
        </div>
        <div className="form-input">
          <Select
            onChange={(value) => setFieldValue("status", value)}
            value={values.status}
            status={errors.status && touched.status ? "error" : null}
            optionFilterProp="children"
            showSearch
          >
            <Select.Option key={0} value={0}>
              Integração
            </Select.Option>
            <Select.Option key={1} value={1}>
              Produção
            </Select.Option>
            <Select.Option key={2} value={2}>
              Cancelado
            </Select.Option>
          </Select>
        </div>
        {errors.status && touched.status && (
          <div className="form-error">{errors.status}</div>
        )}
      </div>
    </>
  );
}

export default BaseForm;
