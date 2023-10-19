import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import { Select } from "components/Inputs";
import Tag from "components/Tag";
import Heading from "components/Heading";
import { Col } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";
import { Tooltip } from "antd";

export default function MainFilters() {
  const { t } = useTranslation();
  const segmentList = useSelector((state) => state.segments.list);
  const { values, setFieldValue } = useContext(AdvancedFilterContext);

  return (
    <>
      <Col md={7} lg={4} xxl={4}>
        <Heading as="label" size="14px">
          {t("screeningList.segment")}:
        </Heading>
        <Select
          style={{ width: "100%", maxWidth: "400px" }}
          value={values.idSegmentList}
          onChange={(val) => setFieldValue({ idSegmentList: val })}
          showSearch
          optionFilterProp="children"
          mode="multiple"
          allowClear
        >
          {segmentList.map(({ id, description: text }) => (
            <Select.Option key={id} value={id}>
              {text}
            </Select.Option>
          ))}
        </Select>
      </Col>
      <Col md={5} lg={3} xxl={2}>
        <Heading as="label" size="14px">
          Substância:
        </Heading>
        <Select
          style={{ width: "100%" }}
          value={values.hasSubstance}
          onChange={(val) => setFieldValue({ hasSubstance: val })}
          showSearch
          optionFilterProp="children"
          allowClear
        >
          <Select.Option key={0} value={true}>
            <Tag color="green">Preenchido</Tag>
          </Select.Option>
          <Select.Option key={1} value={false}>
            <Tag color="red">Vazio</Tag>
          </Select.Option>
        </Select>
      </Col>
      <Col md={5} lg={3} xxl={2}>
        <Heading as="label" size="14px">
          Unidade Padrão:
        </Heading>
        <Select
          style={{ width: "100%" }}
          value={values.hasDefaultUnit}
          onChange={(val) => setFieldValue({ hasDefaultUnit: val })}
          showSearch
          optionFilterProp="children"
          allowClear
        >
          <Select.Option key={0} value={true}>
            <Tag color="green">Preenchido</Tag>
          </Select.Option>
          <Select.Option key={1} value={false}>
            <Tag color="red">Vazio</Tag>
          </Select.Option>
        </Select>
      </Col>
      <Col md={5} lg={3} xxl={2}>
        <Heading as="label" size="14px">
          Unidade Custo:
        </Heading>
        <Select
          style={{ width: "100%" }}
          value={values.hasPriceUnit}
          onChange={(val) => setFieldValue({ hasPriceUnit: val })}
          showSearch
          optionFilterProp="children"
          allowClear
        >
          <Select.Option key={0} value={true}>
            <Tag color="green">Preenchido</Tag>
          </Select.Option>
          <Select.Option key={1} value={false}>
            <Tag color="red">Vazio</Tag>
          </Select.Option>
        </Select>
      </Col>
      <Col md={5} lg={3} xxl={2}>
        <Heading as="label" size="14px">
          <Tooltip title="Possui fator de conversão para unidade de custo?">
            Fat. Unid. Custo:
          </Tooltip>
        </Heading>
        <Select
          style={{ width: "100%" }}
          value={values.hasPriceConversion}
          onChange={(val) => setFieldValue({ hasPriceConversion: val })}
          showSearch
          optionFilterProp="children"
          allowClear
        >
          <Select.Option key={0} value={true}>
            <Tag color="green">Preenchido</Tag>
          </Select.Option>
          <Select.Option key={1} value={false}>
            <Tag color="red">Vazio</Tag>
          </Select.Option>
        </Select>
      </Col>
    </>
  );
}
