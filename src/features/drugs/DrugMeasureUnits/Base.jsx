import React from "react";
import { useSelector } from "react-redux";
import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";

import { InputNumber, Select } from "components/Inputs";

function BaseForm() {
  const { t } = useTranslation();
  const { values, errors, touched, handleBlur, setFieldValue } =
    useFormikContext();
  const unitStatus = useSelector(
    (state) => state.drugMeasureUnits.units.status
  );
  const units = useSelector((state) => state.drugMeasureUnits.units.data.units);

  return (
    <>
      <div
        className={`form-row ${
          errors.idMeasureUnit && touched.idMeasureUnit ? "error" : ""
        }`}
      >
        <div className="form-label">
          <label>{t("tableHeader.measureUnit")}:</label>
        </div>
        <div className="form-input">
          <Select
            id="idMeasureUnit"
            name="idMeasureUnit"
            onChange={(value) => setFieldValue("idMeasureUnit", value)}
            onBlur={handleBlur}
            value={values.idMeasureUnit}
            status={
              errors.idMeasureUnit && touched.idMeasureUnit ? "error" : null
            }
            optionFilterProp="children"
            disabled={unitStatus !== "succeeded"}
            loading={unitStatus !== "succeeded"}
            showSearch
            autoFocus
            allowClear
          >
            {units &&
              units.map(({ id, description }) => (
                <Select.Option key={id} value={id}>
                  {description} ({id})
                </Select.Option>
              ))}
          </Select>
        </div>
        {errors.idMeasureUnit && touched.idMeasureUnit && (
          <div className="form-error">{errors.idMeasureUnit}</div>
        )}
      </div>

      <div
        className={`form-row ${errors.factor && touched.factor ? "error" : ""}`}
      >
        <div className="form-label">
          <label>{t("labels.factor")}:</label>
        </div>
        <div className="form-input">
          <InputNumber
            id="factor"
            name="factor"
            min={0}
            max={99999}
            value={values.factor}
            onBlur={handleBlur}
            onChange={(value) => setFieldValue("factor", value)}
            status={errors.factor && touched.factor ? "error" : null}
          />
        </div>
        {errors.factor && touched.factor && (
          <div className="form-error">{errors.factor}</div>
        )}
      </div>
    </>
  );
}

export default BaseForm;
