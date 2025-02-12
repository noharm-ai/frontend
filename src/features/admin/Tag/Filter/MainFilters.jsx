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
        <Heading as="label" $size="14px">
          Situação:
        </Heading>
        <Select
          style={{ width: "100%" }}
          value={values.active}
          onChange={(val) => setFieldValue({ active: val })}
          showSearch
          optionFilterProp="children"
          allowClear
        >
          <Select.Option key={0} value={true}>
            <Tag color="green">Ativo</Tag>
          </Select.Option>
          <Select.Option key={1} value={false}>
            <Tag>Inativo</Tag>
          </Select.Option>
        </Select>
      </Col>
    </>
  );
}
