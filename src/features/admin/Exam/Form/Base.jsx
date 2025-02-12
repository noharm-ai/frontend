import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import "styled-components";
import { useFormikContext } from "formik";
import { CopyOutlined } from "@ant-design/icons";

import { InputNumber, Input, Select } from "components/Inputs";
import Button from "components/Button";
import Switch from "components/Switch";
import Tooltip from "components/Tooltip";
import notification from "components/notification";
import { getErrorMessage } from "utils/errorHandler";
import { getExamRefs } from "features/lists/ListsSlice";
import { listExamTypes } from "../ExamSlice";

export default function Base() {
  const dispatch = useDispatch();
  const segments = useSelector((state) => state.segments.list);
  const examTypes = useSelector((state) => state.admin.exam.examTypes.list);
  const examTypesStatus = useSelector(
    (state) => state.admin.exam.examTypes.status
  );
  const { t } = useTranslation();
  const { values, setFieldValue, errors } = useFormikContext();
  const [refActive, setRefActive] = useState(false);
  const [refs, setRefs] = useState([]);
  const { type, name, initials, min, max, ref, active } = values;

  useEffect(() => {
    if (examTypes.length === 0 && values.new) {
      dispatch(listExamTypes());
    }
  }, []); //eslint-disable-line

  useEffect(() => {
    if (refActive) {
      dispatch(getExamRefs()).then((response) => {
        if (response.error) {
          notification.error({
            message: getErrorMessage(response, t),
          });
        } else {
          const { data } = response.payload;
          setRefs(data);
        }
      });
    }
  }, [refActive, dispatch, t]);

  const applyRef = (index) => {
    setFieldValue("name", refs[index].name);
    setFieldValue("initials", refs[index].initials);
    setFieldValue("ref", refs[index].ref);
    setFieldValue("min", refs[index].min);
    setFieldValue("max", refs[index].max);
  };

  return (
    <>
      <div className={`form-row ${errors.type ? "error" : ""}`}>
        <div className="form-label">
          <label>Segmento:</label>
        </div>
        <div className="form-input">
          <Select
            optionFilterProp="children"
            showSearch
            placeholder="Selecione o segmento..."
            onChange={(value) => setFieldValue("idSegment", value)}
            value={values.idSegment}
            loading={examTypesStatus === "loading"}
            disabled={!values.new}
          >
            {segments.map((item) => (
              <Select.Option key={item.id} value={item.id}>
                {item.description}
              </Select.Option>
            ))}
          </Select>
        </div>
        {errors.idSegment && (
          <div className="form-error">{errors.idSegment}</div>
        )}
      </div>

      <div className={`form-row ${errors.type ? "error" : ""}`}>
        <div className="form-label">
          <label>Tipo de Exame:</label>
        </div>
        <div className="form-input">
          <div style={{ display: "flex" }}>
            <Select
              optionFilterProp="children"
              showSearch
              placeholder="Selecione o exame..."
              onChange={(value) => setFieldValue("type", value)}
              value={type}
              loading={examTypesStatus === "loading"}
              disabled={!values.new}
            >
              {examTypes.map((item) => (
                <Select.Option key={item} value={item}>
                  {item}
                </Select.Option>
              ))}
            </Select>
            <Tooltip title="Copiar da referência">
              <Button
                shape="circle"
                icon={<CopyOutlined />}
                type="primary"
                style={{ marginLeft: "5px" }}
                onClick={() => setRefActive(!refActive)}
              />
            </Tooltip>
          </div>
        </div>
        {errors.type && <div className="form-error">{errors.type}</div>}
      </div>

      {refActive && (
        <div className={`form-row`}>
          <div className="form-label">
            <label>Referência Curadoria:</label>
          </div>
          <div className="form-input">
            <Select
              optionFilterProp="children"
              showSearch
              placeholder="Selecione a referência..."
              onChange={(value) => applyRef(value)}
              loading={!refs.length}
            >
              {refs &&
                refs.map((item, index) => (
                  <Select.Option key={index} value={index}>
                    {item.segment} - {item.name} ({item.type})
                  </Select.Option>
                ))}
            </Select>
          </div>
        </div>
      )}

      <div className={`form-row ${errors.name ? "error" : ""}`}>
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
        {errors.name && <div className="form-error">{errors.name}</div>}
      </div>

      <div className={`form-row ${errors.initials ? "error" : ""}`}>
        <div className="form-label">
          <label>Rótulo:</label>
        </div>
        <div className="form-input">
          <Input
            value={initials}
            onChange={({ target }) => setFieldValue("initials", target.value)}
            maxLength={50}
          />
        </div>
        {errors.initials && <div className="form-error">{errors.initials}</div>}
      </div>

      <div className={`form-row ${errors.ref ? "error" : ""}`}>
        <div className="form-label">
          <label>Referência:</label>
        </div>
        <div className="form-input">
          <Input
            value={ref}
            onChange={({ target }) => setFieldValue("ref", target.value)}
            maxLength={250}
          />
        </div>
        {errors.ref && <div className="form-error">{errors.ref}</div>}
      </div>

      <div className={`form-row ${errors.min ? "error" : ""}`}>
        <div className="form-label">
          <label>Valor mínimo:</label>
        </div>
        <div className="form-input">
          <InputNumber
            style={{
              width: 120,
            }}
            min={-999999}
            max={999999}
            value={min}
            onChange={(value) => setFieldValue("min", value)}
          />
        </div>
        {errors.min && <div className="form-error">{errors.min}</div>}
      </div>

      <div className={`form-row ${errors.max ? "error" : ""}`}>
        <div className="form-label">
          <label>Valor máximo:</label>
        </div>
        <div className="form-input">
          <InputNumber
            style={{
              width: 120,
            }}
            min={0}
            max={999999}
            value={max}
            onChange={(value) => setFieldValue("max", value)}
          />
        </div>
        {errors.max && <div className="form-error">{errors.max}</div>}
      </div>

      <div className={`form-row ${errors.active ? "error" : ""}`}>
        <div className="form-label">
          <label>Ativo:</label>
        </div>
        <div className="form-input">
          <Switch
            onChange={(active) => setFieldValue("active", active)}
            checked={active}
          />
        </div>
        {errors.active && <div className="form-error">{errors.active}</div>}
      </div>
    </>
  );
}
