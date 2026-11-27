import { useContext } from "react";
import type { Dayjs } from "dayjs";

import { useAppSelector } from "src/store";
import { RangeDatePicker, Select, SelectCustom } from "components/Inputs";
import Heading from "components/Heading";
import { Col } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";
import type { CultureReportFilters } from "../../transformers";

// what components/AdvancedFilter (still JS) hands its filters through context
interface FilterContextValue {
  values: CultureReportFilters;
  setFieldValue: (values: Partial<CultureReportFilters>) => void;
}

export function MainFilters() {
  const exams = useAppSelector(
    (state) => state.reportsArea.culture.filterData.exams,
  );
  const materials = useAppSelector(
    (state) => state.reportsArea.culture.filterData.examMaterials,
  );
  const microorganisms = useAppSelector(
    (state) => state.reportsArea.culture.filterData.microorganisms,
  );
  const status = useAppSelector((state) => state.reportsArea.culture.status);
  const { values, setFieldValue } = useContext(
    AdvancedFilterContext,
  ) as FilterContextValue;

  return (
    <>
      <Col md={7} lg={5} xxl={5}>
        <Heading as="label" $size="14px">
          Período de Coleta:
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
          Exame:
        </Heading>
        <SelectCustom
          style={{ width: "100%", maxWidth: "400px" }}
          value={values.examNameList}
          onChange={(val: string[]) => setFieldValue({ examNameList: val })}
          showSearch
          optionFilterProp="children"
          mode="multiple"
          allowClear
          maxTagCount="responsive"
          loading={status === "loading"}
          autoClearSearchValue={false}
        >
          {exams.map((i) => (
            <Select.Option key={i} value={i}>
              {i}
            </Select.Option>
          ))}
        </SelectCustom>
      </Col>
      <Col md={7} lg={5} xxl={5}>
        <Heading as="label" $size="14px">
          Material:
        </Heading>
        <SelectCustom
          style={{ width: "100%", maxWidth: "400px" }}
          value={values.examMaterialNameList}
          onChange={(val: string[]) =>
            setFieldValue({ examMaterialNameList: val })
          }
          showSearch
          optionFilterProp="children"
          mode="multiple"
          allowClear
          maxTagCount="responsive"
          loading={status === "loading"}
          autoClearSearchValue={false}
        >
          {materials.map((i) => (
            <Select.Option key={i} value={i}>
              {i}
            </Select.Option>
          ))}
        </SelectCustom>
      </Col>
      <Col md={7} lg={5} xxl={5}>
        <Heading as="label" $size="14px">
          Microorganismo:
        </Heading>
        <SelectCustom
          style={{ width: "100%", maxWidth: "400px" }}
          value={values.microorganismList}
          onChange={(val: string[]) =>
            setFieldValue({ microorganismList: val })
          }
          showSearch
          optionFilterProp="children"
          mode="multiple"
          allowClear
          maxTagCount="responsive"
          loading={status === "loading"}
          autoClearSearchValue={false}
        >
          {microorganisms.map((i) => (
            <Select.Option key={i} value={i}>
              {i}
            </Select.Option>
          ))}
        </SelectCustom>
      </Col>
    </>
  );
}
