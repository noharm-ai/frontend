import React, { useContext } from "react";
import { useSelector } from "react-redux";

import { Select, InputNumber } from "components/Inputs";
import Tag from "components/Tag";
import Heading from "components/Heading";
import Tooltip from "components/Tooltip";
import { Col } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";

export default function MainFilters() {
  const { values, setFieldValue } = useContext(AdvancedFilterContext);
  const segmentList = useSelector((state) => state.segments.list);

  return (
    <>
      <Col md={7} lg={4} xxl={4}>
        <Heading as="label" $size="14px">
          Segmento Referência:
        </Heading>
        <Select
          style={{ width: "100%", maxWidth: "400px" }}
          value={values.idSegment}
          onChange={(val) => setFieldValue({ idSegment: val })}
          showSearch
          optionFilterProp="children"
        >
          {segmentList.map(({ id, description: text }) => (
            <Select.Option key={id} value={id}>
              {text}
            </Select.Option>
          ))}
        </Select>
      </Col>
      <Col md={5} lg={4} xxl={3}>
        <Heading as="label" $size="14px">
          Fator de Conversão:
        </Heading>
        <Select
          style={{ width: "100%" }}
          value={values.conversionType}
          onChange={(val) => setFieldValue({ conversionType: val })}
          showSearch
          optionFilterProp="children"
          allowClear
        >
          <Select.Option key={0} value={"filled"}>
            <Tag color="green">Preenchido</Tag>
          </Select.Option>
          <Select.Option key={1} value={"empty"}>
            <Tag color="red">Vazio</Tag>
          </Select.Option>
          <Select.Option key={2} value={"mismatch"}>
            <Tag color="red">Mismatch (inferência)</Tag>
          </Select.Option>
        </Select>
      </Col>
      <Col md={5} lg={3} xxl={2}>
        <Heading as="label" $size="14px">
          <Tooltip title="Quantidade mínima que o medicamento foi prescrito">
            Contagem mín.:
          </Tooltip>
        </Heading>
        <InputNumber
          value={values.minDrugCount}
          min={0}
          style={{ width: "100%" }}
          onChange={(val) => setFieldValue({ minDrugCount: val })}
        />
      </Col>
    </>
  );
}
