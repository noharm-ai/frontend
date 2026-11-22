import { useContext } from "react";

import { useAppSelector } from "src/store";
import { Select, SelectCustom } from "components/Inputs";
import Heading from "components/Heading";
import { Col } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";
import type { PrescriptionHistoryFilters } from "../../transformers";

// what components/AdvancedFilter (still JS) hands its filters through context
interface FilterContextValue {
  values: PrescriptionHistoryFilters;
  setFieldValue: (values: Partial<PrescriptionHistoryFilters>) => void;
}

export function MainFilters() {
  const status = useAppSelector(
    (state) => state.reportsArea.prescriptionHistory.status,
  );
  const responsibles = useAppSelector(
    (state) => state.reportsArea.prescriptionHistory.filterData.responsibles,
  );
  const { values, setFieldValue } = useContext(
    AdvancedFilterContext,
  ) as FilterContextValue;

  return (
    <>
      <Col md={7} lg={5} xxl={5}>
        <Heading as="label" $size="14px">
          Responsável:
        </Heading>
        <SelectCustom
          style={{ width: "100%", maxWidth: "400px" }}
          value={values.responsibleList}
          onChange={(val: string[]) => setFieldValue({ responsibleList: val })}
          showSearch
          optionFilterProp="children"
          mode="multiple"
          allowClear
          maxTagCount="responsive"
          loading={status === "loading"}
          autoClearSearchValue={false}
        >
          {responsibles.map((i) => (
            <Select.Option key={i} value={i}>
              {i}
            </Select.Option>
          ))}
        </SelectCustom>
      </Col>
    </>
  );
}
