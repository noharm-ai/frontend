import React from "react";
import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";

import { Input, Select } from "components/Inputs";
import Switch from "components/Switch";

function BaseForm() {
  const { t } = useTranslation();
  const { values, errors, touched, handleChange, handleBlur, setFieldValue } =
    useFormikContext();

  return (
    <>
      <div
        className={`form-row ${
          errors.description && touched.description ? "error" : ""
        }`}
      >
        <div className="form-label">
          <label>Nome:</label>
        </div>
        <div className="form-input">
          <Input
            name="description"
            value={values.description}
            onChange={handleChange}
            onBlur={handleBlur}
            status={errors.description && touched.description ? "error" : null}
          />
        </div>
        {errors.description && touched.description && (
          <div className="form-error">{errors.description}</div>
        )}
      </div>

      <div className={`form-row ${errors.type && touched.type ? "error" : ""}`}>
        <div className="form-label">
          <label>Tipo:</label>
        </div>
        <div className="form-input">
          <Select
            optionFilterProp="children"
            showSearch
            style={{ width: "100%" }}
            value={values.type}
            onChange={(value) => setFieldValue("type", value)}
          >
            <Select.Option key={1} value={1}>
              Tipo adulto
            </Select.Option>

            <Select.Option key={2} value={2}>
              Tipo pediátrico
            </Select.Option>
          </Select>
        </div>
        {errors.type && touched.type && (
          <div className="form-error">{errors.type}</div>
        )}
      </div>

      <div
        className={`form-row ${errors.active && touched.active ? "error" : ""}`}
      >
        <div className="form-label">
          <label>{t("labels.active")}:</label>
        </div>
        <div className="form-input">
          <Switch
            id="active"
            name="active"
            checked={values.active}
            onChange={(value) => setFieldValue("active", value)}
            onBlur={handleBlur}
            status={errors.active && touched.active ? "error" : null}
            checkedChildren={t("labels.yes")}
            unCheckedChildren={t("labels.no")}
          />
        </div>
        {errors.active && touched.active && (
          <div className="form-error">{errors.active}</div>
        )}
      </div>
    </>
  );
}

export default BaseForm;
