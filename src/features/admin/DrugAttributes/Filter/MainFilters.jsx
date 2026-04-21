import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import { Select, InputNumber } from "components/Inputs";
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
        <Heading as="label" $size="14px">
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
        <Heading as="label" $size="14px">
          Substância:
        </Heading>
        <Select
          style={{ width: "100%" }}
          value={values.substanceStatus}
          onChange={(val) => setFieldValue({ substanceStatus: val })}
          showSearch
          optionFilterProp="children"
          allowClear
        >
          <Select.Option key={0} value={"empty"}>
            <Tag color="red">Não definida</Tag>
          </Select.Option>
          <Select.Option key={1} value={"confirmed"}>
            <Tag color="blue">Definida</Tag>
          </Select.Option>

          <Select.Option key={1} value={"not_confirmed_95"}>
            <Tag color="green">IA: até 95%</Tag>
          </Select.Option>
          <Select.Option key={1} value={"not_confirmed_85"}>
            <Tag color="green">IA: até 85%</Tag>
          </Select.Option>
          <Select.Option key={1} value={"not_confirmed_75"}>
            <Tag color="orange">IA: até 75%</Tag>
          </Select.Option>
          <Select.Option key={1} value={"not_confirmed_50"}>
            <Tag color="red">IA: até 50%</Tag>
          </Select.Option>
          <Select.Option key={1} value={"not_confirmed"}>
            <Tag color="purple">IA: todos</Tag>
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
