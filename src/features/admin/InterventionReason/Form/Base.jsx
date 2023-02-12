import React from "react";
import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";

import { Input } from "components/Inputs";

function BaseForm() {
  const { t } = useTranslation();
  const { values, errors, touched, handleChange, handleBlur } =
    useFormikContext();

  return (
    <>
      <div className={`form-row ${errors.name && touched.name ? "error" : ""}`}>
        <div className="form-label">
          <label>{t("labels.reason")}:</label>
        </div>
        <div className="form-input">
          <Input
            id="name"
            name="name"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            status={errors.name && touched.name ? "error" : null}
          />
        </div>
        {errors.name && touched.name && (
          <div className="form-error">{errors.name}</div>
        )}
      </div>
    </>
  );
}

export default BaseForm;
