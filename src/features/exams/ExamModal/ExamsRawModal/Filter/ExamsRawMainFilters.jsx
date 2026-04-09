import React, { useContext } from "react";
import { useSelector } from "react-redux";

import { RangeDatePicker, Select, SelectCustom } from "components/Inputs";
import Heading from "components/Heading";
import { Col } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";

export function ExamsRawMainFilters() {
  const types = useSelector((state) => state.examsModal.raw.filterData.types);
  const status = useSelector((state) => state.examsModal.raw.status);
  const { values, setFieldValue } = useContext(AdvancedFilterContext);

  return (
    <>
      <Col md={7} lg={5} xxl={5}>
        <Heading as="label" $size="14px">
          Data do Exame:
        </Heading>
        <RangeDatePicker
          format="DD/MM/YYYY"
          value={values.dateRange}
          onChange={(val) => setFieldValue({ dateRange: val })}
          allowClear
          style={{ width: "100%" }}
        />
      </Col>
      <Col md={8} lg={8} xxl={8}>
        <Heading as="label" $size="14px">
          Tipo:
        </Heading>
        <SelectCustom
          style={{ width: "100%", maxWidth: "700px" }}
          value={values.typesList}
          onChange={(val) => setFieldValue({ typesList: val })}
          showSearch
          optionFilterProp="children"
          mode="multiple"
          allowClear
          maxTagCount="responsive"
          loading={status === "loading"}
          autoClearSearchValue={false}
        >
          {types.map((i) => (
            <Select.Option key={i} value={i}>
              {i}
            </Select.Option>
          ))}
        </SelectCustom>
      </Col>
    </>
  );
}
