import React, { useContext } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import { Input, Select } from "components/Inputs";
import Tag from "components/Tag";
import Heading from "components/Heading";
import { Col } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";

export default function MainFilters() {
  const { t } = useTranslation();
  const segmentList = useSelector((state) => state.segments.list);
  const { values, setFieldValue } = useContext(AdvancedFilterContext);

  return (
    <>
      <Col md={7} lg={5} xxl={4}>
        <Heading as="label" size="14px">
          {t("screeningList.segment")}:
        </Heading>
        <Select
          style={{ width: "100%" }}
          placeholder="Selecione um segmento..."
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
      <Col md={7} lg={5} xxl={4}>
        <Heading as="label" htmlFor="date" size="14px">
          {t("tableHeader.drug")}:
        </Heading>
        <Input
          value={values.term}
          onChange={({ target }) =>
            setFieldValue({ term: target.value !== "" ? target.value : null })
          }
        />
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
          Conversão Unid. Preço:
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
