import React from "react";
import "styled-components/macro";
import { useFormikContext } from "formik";
import { useSelector } from "react-redux";

import { Input, Select } from "components/Inputs";
import Switch from "components/Switch";

export default function Base() {
  const { values, setFieldValue, errors, touched } = useFormikContext();
  const substanceClasses = useSelector(
    (state) => state.lists.substanceClasses.list
  );
  const fetchStatus = useSelector(
    (state) => state.lists.substanceClasses.status
  );
  const { sctid, name, isAdd, idclass, active } = values;

  return (
    <>
      <div
        className={`form-row ${errors.sctid && touched.sctid ? "error" : ""}`}
      >
        <div className="form-label">
          <label>SCTID:</label>
        </div>
        <div className="form-input">
          {isAdd && (
            <Input
              value={sctid}
              onChange={({ target }) => setFieldValue("sctid", target.value)}
              maxLength={100}
            />
          )}
          {!isAdd && sctid}
        </div>
        {errors.sctid && touched.sctid && (
          <div className="form-error">{errors.sctid}</div>
        )}
      </div>

      <div className={`form-row ${errors.name && touched.name ? "error" : ""}`}>
        <div className="form-label">
          <label>Nome:</label>
        </div>
        <div className="form-input">
          <Input
            value={name}
            onChange={({ target }) => setFieldValue("name", target.value)}
            maxLength={250}
          />
        </div>
        {errors.name && touched.name && (
          <div className="form-error">{errors.name}</div>
        )}
      </div>

      <div
        className={`form-row ${
          errors.idclass && touched.idclass ? "error" : ""
        }`}
      >
        <div className="form-label">
          <label>Classe:</label>
        </div>
        <div className="form-input">
          <Select
            id="idclass"
            optionFilterProp="children"
            showSearch
            style={{ width: "100%" }}
            value={idclass}
            onChange={(value, option) => setFieldValue("idclass", value)}
            loading={fetchStatus === "loading"}
          >
            {substanceClasses.map(({ id, name }) => (
              <Select.Option key={id} value={id}>
                {name}
              </Select.Option>
            ))}
          </Select>
        </div>
        {errors.idclass && touched.idclass && (
          <div className="form-error">{errors.idclass}</div>
        )}
      </div>

      <div
        className={`form-row ${errors.active && touched.active ? "error" : ""}`}
      >
        <div className="form-label">
          <label>Ativo:</label>
        </div>
        <div className="form-input">
          <Switch
            onChange={(active) => setFieldValue("active", active)}
            checked={active}
            style={{
              marginLeft: 10,
              marginRight: 5,
            }}
          />
        </div>
      </div>
    </>
  );
}
