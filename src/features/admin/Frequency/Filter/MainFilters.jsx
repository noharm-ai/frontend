import React, { useContext } from "react";

import { Select } from "components/Inputs";
import Tag from "components/Tag";
import Heading from "components/Heading";
import { Col } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";

export default function MainFilters() {
  const { values, setFieldValue } = useContext(AdvancedFilterContext);

  return (
    <>
      <Col md={5} lg={4} xxl={3}>
        <Heading as="label" size="14px">
          Frequência Dia:
        </Heading>
        <Select
          style={{ width: "100%" }}
          value={values.hasDailyFrequency}
          onChange={(val) => setFieldValue({ hasDailyFrequency: val })}
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
