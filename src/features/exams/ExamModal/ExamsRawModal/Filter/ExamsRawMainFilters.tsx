import { useContext } from "react";

import { useAppSelector } from "src/store";
import { RangeDatePicker, Select, SelectCustom } from "components/Inputs";
import Heading from "components/Heading";
import { Col } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";
import { IExamRawFilters } from "../transformers";

export function ExamsRawMainFilters() {
  const types = useAppSelector(
    (state) => (state as any).examsModal.raw.filterData.types as string[]
  );
  const status = useAppSelector(
    (state) => (state as any).examsModal.raw.status as string
  );
  const { values, setFieldValue } = useContext(AdvancedFilterContext) as {
    values: IExamRawFilters;
    setFieldValue: (fields: Partial<IExamRawFilters>) => void;
  };

  return (
    <>
      <Col md={7} lg={5} xxl={5}>
        {/* @ts-expect-error styled-component props */}
        <Heading as="label" $size="14px">
          Data do Exame:
        </Heading>
        <RangeDatePicker
          format="DD/MM/YYYY"
          value={values.dateRange}
          onChange={(val: any) => setFieldValue({ dateRange: val })}
          allowClear
          style={{ width: "100%" }}
        />
      </Col>
      <Col md={8} lg={8} xxl={8}>
        {/* @ts-expect-error styled-component props */}
        <Heading as="label" $size="14px">
          Tipo:
        </Heading>
        <SelectCustom
          style={{ width: "100%", maxWidth: "700px" }}
          value={values.typesList}
          onChange={(val: any) => setFieldValue({ typesList: val })}
          showSearch
          optionFilterProp="children"
          mode="multiple"
          allowClear
          maxTagCount="responsive"
          loading={status === "loading"}
          autoClearSearchValue={false}
        >
          {types.map((i: string) => (
            <Select.Option key={i} value={i}>
              {i}
            </Select.Option>
          ))}
        </SelectCustom>
      </Col>
    </>
  );
}
