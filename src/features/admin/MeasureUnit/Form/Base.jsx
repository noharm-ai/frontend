import React, { useRef, useEffect } from "react";
import { useFormikContext } from "formik";

import { Select } from "components/Inputs";

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
            <Select.Option value={"mg"}>mg</Select.Option>
            <Select.Option value={"ml"}>ml</Select.Option>

            <Select.Option value={"mcg"}>mcg</Select.Option>
            <Select.Option value={"UI"}>UI</Select.Option>
          </Select>
        </div>
      </div>
    </>
  );
}
