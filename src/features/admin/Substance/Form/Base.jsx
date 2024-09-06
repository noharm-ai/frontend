import React, { useRef, useEffect } from "react";
import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import { InputNumber } from "antd";

import Switch from "components/Switch";

function BaseForm({ open }) {
  const { t } = useTranslation();
  const inputRef = useRef(null);
  const { values, errors, touched, handleBlur, setFieldValue } =
    useFormikContext();

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
        inputRef.current.select();
      }, 0);
    }
  }, [open, inputRef]);

  return (
    <>
      <div className={`form-row`}>
        <div className="form-label">
          <label>Frequência:</label>
        </div>
        <div className="form-input">{values.name}</div>
      </div>
      <div
        className={`form-row ${
          errors.dailyFrequency && touched.dailyFrequency ? "error" : ""
        }`}
      >
        <div className="form-label">
          <label>Frequência/Dia:</label>
        </div>
        <div className="form-input">
          <InputNumber
            decimalSeparator=","
            onChange={(value) => setFieldValue("dailyFrequency", value)}
            value={values.dailyFrequency}
            ref={inputRef}
            style={{ width: "100%" }}
          />
        </div>
        {errors.dailyFrequency && touched.dailyFrequency && (
          <div className="form-error">{errors.dailyFrequency}</div>
        )}
      </div>

      <div
        className={`form-row ${
          errors.fasting && touched.fasting ? "error" : ""
        }`}
      >
        <div className="form-label">
          <label>Jejum:</label>
        </div>
        <div className="form-input">
          <Switch
            id="fasting"
            name="fasting"
            checked={values.fasting}
            onChange={(value) => setFieldValue("fasting", value)}
            onBlur={handleBlur}
            status={errors.fasting && touched.fasting ? "error" : null}
            checkedChildren={t("labels.yes")}
            unCheckedChildren={t("labels.no")}
          />
        </div>
        {errors.fasting && touched.fasting && (
          <div className="form-error">{errors.fasting}</div>
        )}
      </div>
    </>
  );
}

export default BaseForm;
