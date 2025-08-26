import { useContext } from "react";

import { useAppSelector } from "src/store";
import Heading from "components/Heading";
import { Col, Row } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";
import { Select, SelectCustom } from "components/Inputs";

export function SecondaryFilters() {
  const { values, setFieldValue }: any = useContext(AdvancedFilterContext);
  const entities = useAppSelector(
    (state) => state.reportsArea.integrationNifiLint.filterData.entities
  );
  const groups = useAppSelector(
    (state) => state.reportsArea.integrationNifiLint.filterData.groups
  );

  return (
    <Row gutter={[20, 20]}>
      <Col md={24} xl={16} xxl={14}>
        {/* @ts-expect-error legacy code */}
        <Heading as="label" $size="14px">
          Processador/Controller:
        </Heading>
        <SelectCustom
          style={{ width: "100%", maxWidth: "400px" }}
          value={values.entityList}
          onChange={(val: string[]) => setFieldValue({ entityList: val })}
          showSearch
          optionFilterProp="children"
          mode="multiple"
          allowClear
          maxTagCount="responsive"
          loading={status === "loading"}
          autoClearSearchValue={false}
        >
          {entities.map((i) => (
            <Select.Option key={i} value={i}>
              {i}
            </Select.Option>
          ))}
        </SelectCustom>
      </Col>

      <Col md={24} xl={16} xxl={14}>
        {/* @ts-expect-error legacy code */}
        <Heading as="label" $size="14px">
          Grupo:
        </Heading>
        <SelectCustom
          style={{ width: "100%", maxWidth: "400px" }}
          value={values.groupList}
          onChange={(val: string[]) => setFieldValue({ groupList: val })}
          showSearch
          optionFilterProp="children"
          mode="multiple"
          allowClear
          maxTagCount="responsive"
          loading={status === "loading"}
          autoClearSearchValue={false}
        >
          {groups.map((i) => (
            <Select.Option key={i} value={i}>
              {i}
            </Select.Option>
          ))}
        </SelectCustom>
      </Col>
    </Row>
  );
}
