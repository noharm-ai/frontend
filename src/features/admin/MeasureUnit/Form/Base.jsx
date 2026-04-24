import React, { useRef, useEffect } from "react";
import { useFormikContext } from "formik";

import { Select } from "components/Inputs";
import { MeasureUnitEnum } from "models/MeasureUnitEnum";

export function BaseForm({ open }) {
  const inputRef = useRef(null);
  const { values, setFieldValue } = useFormikContext();

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
          <label>Unidade de medida:</label>
        </div>
        <div className="form-input">{values.name}</div>
      </div>
      <div className={`form-row`}>
        <div className="form-label">
          <label>Unidade de medida NoHarm:</label>
        </div>
        <div className="form-input">
          <Select
            optionFilterProp="children"
            showSearch
            value={values.measureUnitNh}
            onChange={(value) => setFieldValue("measureUnitNh", value)}
            allowClear
          >
            {MeasureUnitEnum.getDefaultUnits().map(({ value, label }) => (
              <Select.Option key={value} value={value}>
                {label}
              </Select.Option>
            ))}
          </Select>
        </div>
      </div>
    </>
  );
}
