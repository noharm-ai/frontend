import React, { useContext } from "react";

import { Select } from "components/Inputs";
import Heading from "components/Heading";
import { Col } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";

export default function MainFilters() {
  const { values, setFieldValue } = useContext(AdvancedFilterContext);

  return (
    <>
      <Col md={6} lg={5} xxl={4}>
        <Heading as="label" size="14px">
          Possui unidade NoHarm:
        </Heading>
        <Select
          style={{ width: "100%" }}
          value={values.hasMeasureUnitNh}
          onChange={(val) => setFieldValue({ hasMeasureUnitNh: val })}
          showSearch
          optionFilterProp="children"
          allowClear
        >
          <Select.Option key={0} value={true}>
            Sim
          </Select.Option>
          <Select.Option key={1} value={false}>
            Não
          </Select.Option>
        </Select>
      </Col>
    </>
  );
}
