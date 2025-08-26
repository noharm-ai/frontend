import { useContext } from "react";

import { useAppSelector } from "src/store";
import { Select, SelectCustom } from "components/Inputs";
import Heading from "components/Heading";
import { Col } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";

export function MainFilters() {
  const status = useAppSelector(
    (state) => state.reportsArea.integrationNifiLint.status
  );
  const levels = useAppSelector(
    (state) => state.reportsArea.integrationNifiLint.filterData.levels
  );
  const schemas = useAppSelector(
    (state) => state.reportsArea.integrationNifiLint.filterData.schemas
  );
  const keys = useAppSelector(
    (state) => state.reportsArea.integrationNifiLint.filterData.keys
  );

  const { values, setFieldValue }: any = useContext(AdvancedFilterContext);

  return (
    <>
      <Col md={7} lg={5} xxl={5}>
        {/* @ts-expect-error legacy code */}
        <Heading as="label" $size="14px">
          Schema:
        </Heading>
        <SelectCustom
          style={{ width: "100%", maxWidth: "400px" }}
          value={values.schemaList}
          onChange={(val: any) => setFieldValue({ schemaList: val })}
          showSearch
          optionFilterProp="children"
          mode="multiple"
          allowClear
          maxTagCount="responsive"
          loading={status === "loading"}
          autoClearSearchValue={false}
        >
          {schemas.map((i) => (
            <Select.Option key={i} value={i}>
              {i}
            </Select.Option>
          ))}
        </SelectCustom>
      </Col>
      <Col md={7} lg={4} xxl={4}>
        {/* @ts-expect-error legacy code */}
        <Heading as="label" $size="14px">
          Level:
        </Heading>
        <SelectCustom
          style={{ width: "100%", maxWidth: "400px" }}
          value={values.levelList}
          onChange={(val: any) => setFieldValue({ levelList: val })}
          showSearch
          optionFilterProp="children"
          mode="multiple"
          allowClear
          maxTagCount="responsive"
          loading={status === "loading"}
          autoClearSearchValue={false}
        >
          {levels.map((i) => (
            <Select.Option key={i} value={i}>
              {i}
            </Select.Option>
          ))}
        </SelectCustom>
      </Col>
      <Col md={7} lg={6} xxl={6}>
        {/* @ts-expect-error legacy code */}
        <Heading as="label" $size="14px">
          Check:
        </Heading>
        <SelectCustom
          style={{ width: "100%", maxWidth: "400px" }}
          value={values.keyList}
          onChange={(val: any) => setFieldValue({ keyList: val })}
          showSearch
          optionFilterProp="children"
          mode="multiple"
          allowClear
          maxTagCount="responsive"
          loading={status === "loading"}
          autoClearSearchValue={false}
        >
          {keys.map((i) => (
            <Select.Option key={i} value={i}>
              {i}
            </Select.Option>
          ))}
        </SelectCustom>
      </Col>
    </>
  );
}
