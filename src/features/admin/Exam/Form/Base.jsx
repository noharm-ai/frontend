import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import "styled-components";
import { useFormikContext } from "formik";
import { CopyOutlined } from "@ant-design/icons";

import { InputNumber, Input, Select } from "components/Inputs";
import Dropdown from "components/Dropdown";
import Button from "components/Button";
import Switch from "components/Switch";
import Tooltip from "components/Tooltip";
import { listExamTypes, listGlobalExams } from "../ExamSlice";

export default function Base() {
  const dispatch = useDispatch();
  const segments = useSelector((state) => state.segments.list);
  const examTypes = useSelector((state) => state.admin.exam.examTypes.list);
  const examTypesStatus = useSelector(
    (state) => state.admin.exam.examTypes.status
  );
  const globalExams = useSelector((state) => state.admin.exam.globalExams.list);
  const globalExamsStatus = useSelector(
    (state) => state.admin.exam.globalExams.status
  );
  const { values, setFieldValue, errors } = useFormikContext();

  const { type, name, initials, min, max, ref, active } = values;

  useEffect(() => {
    if (examTypes.length === 0 && values.new) {
      dispatch(listExamTypes());
    }

    dispatch(listGlobalExams());
  }, []); //eslint-disable-line

  const applyRef = ({ key }) => {
    const examConfig = globalExams.find(
      (item) => item.tpexam === values.tpExamRef
    );

    if (!examConfig) return;

    setFieldValue("name", examConfig.name);
    setFieldValue("initials", examConfig.initials);

    if (key === "adult") {
      setFieldValue("ref", examConfig.ref_adult);
      setFieldValue("min", examConfig.min_adult);
      setFieldValue("max", examConfig.max_adult);
    } else {
      setFieldValue("ref", examConfig.ref_pediatric);
      setFieldValue("min", examConfig.min_pediatric);
      setFieldValue("max", examConfig.max_pediatric);
    }
  };

  const copyOptions = () => {
    const items = [
      {
        key: "adult",
        label: "Adulto",
      },
      {
        key: "pediatric",
        label: "Pediátrico",
      },
    ];

    return {
      items,
      onClick: applyRef,
    };
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
        </div>
        {errors.type && <div className="form-error">{errors.type}</div>}
      </div>

      <div className={`form-row`}>
        <div className="form-label">
          <label>Exame padrão NoHarm:</label>
        </div>
        <div className="form-input">
          <div style={{ display: "flex" }}>
            <Select
              optionFilterProp="children"
              showSearch
              value={values.tpExamRef}
              placeholder="Selecione o exame correspondente..."
              onChange={(value) => setFieldValue("tpExamRef", value)}
              loading={globalExamsStatus === "loading"}
            >
              {globalExams &&
                globalExams.map((item) => (
                  <Select.Option key={item.tpexam} value={item.tpexam}>
                    {item.name} ({item.tpexam})
                  </Select.Option>
                ))}
            </Select>
            <Tooltip title="Copiar da referência">
              <Dropdown menu={copyOptions()}>
                <Button
                  shape="circle"
                  icon={<CopyOutlined />}
                  type="primary"
                  style={{ marginLeft: "5px" }}
                />
              </Dropdown>
            </Tooltip>
          </div>
        </div>
      </div>

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
