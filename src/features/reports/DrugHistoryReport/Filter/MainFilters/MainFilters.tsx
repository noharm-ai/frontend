import { useContext } from "react";
import type { Dayjs } from "dayjs";

import { useAppSelector } from "src/store";
import { RangeDatePicker, Select, SelectCustom } from "components/Inputs";
import Heading from "components/Heading";
import { Col } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";
import type { DrugHistoryFilters } from "../../transformers";

// what components/AdvancedFilter (still JS) hands its filters through context
interface FilterContextValue {
  values: DrugHistoryFilters;
  setFieldValue: (values: Partial<DrugHistoryFilters>) => void;
}

export function MainFilters() {
  const drugs = useAppSelector(
    (state) => state.reportsArea.drugHistory.filterData.drugs,
  );
  const substances = useAppSelector(
    (state) => state.reportsArea.drugHistory.filterData.substances,
  );

  const status = useAppSelector(
    (state) => state.reportsArea.drugHistory.status,
  );
  const { values, setFieldValue } = useContext(
    AdvancedFilterContext,
  ) as FilterContextValue;

  return (
    <>
      <Col md={7} lg={5} xxl={5}>
        <Heading as="label" $size="14px">
          Data de Prescrição:
        </Heading>
        <RangeDatePicker
          format="DD/MM/YYYY"
          value={values.dateRange}
          onChange={(val: Dayjs[] | null) => setFieldValue({ dateRange: val })}
          allowClear
          style={{ width: "100%" }}
        />
      </Col>
      <Col md={7} lg={5} xxl={5}>
        <Heading as="label" $size="14px">
          Medicamento:
        </Heading>
        <SelectCustom
          style={{ width: "100%", maxWidth: "400px" }}
          value={values.drugList}
          onChange={(val: string[]) => setFieldValue({ drugList: val })}
          showSearch
          optionFilterProp="children"
          mode="multiple"
          allowClear
          maxTagCount="responsive"
          loading={status === "loading"}
          autoClearSearchValue={false}
        >
          {drugs.map((i) => (
            <Select.Option key={i} value={i}>
              {i}
            </Select.Option>
          ))}
        </SelectCustom>
      </Col>
      <Col md={7} lg={5} xxl={5}>
        <Heading as="label" $size="14px">
          Substância:
        </Heading>
        <SelectCustom
          style={{ width: "100%", maxWidth: "400px" }}
          value={values.substanceList}
          onChange={(val: string[]) => setFieldValue({ substanceList: val })}
          showSearch
          optionFilterProp="children"
          mode="multiple"
          allowClear
          maxTagCount="responsive"
          loading={status === "loading"}
          autoClearSearchValue={false}
        >
          {substances.map((i) => (
            <Select.Option key={i} value={i}>
              {i}
            </Select.Option>
          ))}
        </SelectCustom>
      </Col>
    </>
  );
}
