import { useContext, type ChangeEvent } from "react";
import type { Dayjs } from "dayjs";

import { useAppSelector } from "src/store";
import {
  RangeDatePicker,
  Select,
  SelectCustom,
  Input,
} from "components/Inputs";
import Heading from "components/Heading";
import { Col } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";
import type { ExamsRawSearchFilters } from "../transformers";

// what components/AdvancedFilter (still JS) hands its filters through context
interface FilterContextValue {
  values: ExamsRawSearchFilters;
  setFieldValue: (values: Partial<ExamsRawSearchFilters>) => void;
}

export function MainFilters() {
  const types = useAppSelector(
    (state) => state.reportsArea.examsRawSearch.filterData.types,
  );
  const status = useAppSelector(
    (state) => state.reportsArea.examsRawSearch.status,
  );
  const { values, setFieldValue } = useContext(
    AdvancedFilterContext,
  ) as FilterContextValue;

  return (
    <>
      <Col md={7} lg={5} xxl={5}>
        <Heading as="label" $size="14px">
          Data do Exame:
        </Heading>
        <RangeDatePicker
          format="DD/MM/YYYY"
          value={values.dateRange}
          onChange={(val: Dayjs[]) => setFieldValue({ dateRange: val })}
          allowClear
          style={{ width: "100%" }}
        />
      </Col>
      <Col md={7} lg={5} xxl={5}>
        <Heading as="label" $size="14px">
          Resultado:
        </Heading>
        <Input
          placeholder={"Ex: 0.6"}
          style={{ width: "100%", maxWidth: "400px" }}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            setFieldValue({ valueString: event.target.value });
          }}
          allowClear
          maxLength={10}
        ></Input>
      </Col>
      <Col md={7} lg={5} xxl={5}>
        <Heading as="label" $size="14px">
          Tipo:
        </Heading>
        <SelectCustom
          style={{ width: "100%", maxWidth: "700px" }}
          value={values.typesList}
          onChange={(val: string[]) => setFieldValue({ typesList: val })}
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
