import React, { useContext } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import { RangeDatePicker, Select, SelectCustom } from "components/Inputs";
import Heading from "components/Heading";
import { Col } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";
import {
  getDateRangePresets,
  dateRangeValid,
  getFilterDepartment,
} from "utils/report";

export default function MainFilters() {
  const { t } = useTranslation();
  const departments = useSelector(
    (state) => state.reportsArea.economy.departments
  );
  const segments = useSelector((state) => state.reportsArea.economy.segments);
  const status = useSelector((state) => state.reportsArea.economy.status);
  const reportDate = useSelector(
    (state) => state.reportsArea.economy.updatedAt
  );
  const { values, setFieldValue } = useContext(AdvancedFilterContext);

  return (
    <>
      <Col md={7} lg={5} xxl={5}>
        <Heading as="label" $size="14px">
          {t("tableHeader.period")}:
        </Heading>
        <RangeDatePicker
          presets={getDateRangePresets(reportDate)}
          disabledDate={dateRangeValid(reportDate, 365)}
          format="DD/MM/YYYY"
          value={values.dateRange}
          onChange={(val) => setFieldValue({ dateRange: val })}
          popupClassName="noArrow"
          allowClear={false}
          style={{ width: "100%" }}
        />
      </Col>
      <Col md={7} lg={5} xxl={5}>
        <Heading as="label" $size="14px">
          Segmento:
        </Heading>
        <SelectCustom
          style={{ width: "100%", maxWidth: "400px" }}
          value={values.segmentList}
          onChange={(val) =>
            setFieldValue({ segmentList: val, departmentList: [] })
          }
          showSearch
          optionFilterProp="children"
          mode="multiple"
          allowClear
          maxTagCount="responsive"
          loading={status === "loading"}
          autoClearSearchValue={false}
        >
          {segments.map((i) => (
            <Select.Option key={i} value={i}>
              {i}
            </Select.Option>
          ))}
        </SelectCustom>
      </Col>
      <Col md={7} lg={5} xxl={5}>
        <Heading as="label" $size="14px">
          Setor:
        </Heading>
        <SelectCustom
          style={{ width: "100%", maxWidth: "400px" }}
          value={values.departmentList}
          onChange={(val) => setFieldValue({ departmentList: val })}
          showSearch
          optionFilterProp="children"
          mode="multiple"
          allowClear
          maxTagCount="responsive"
          loading={status === "loading"}
          autoClearSearchValue={false}
        >
          {getFilterDepartment(departments, values.segmentList).map((i) => (
            <Select.Option
              key={`${i.segment}-${i.department}`}
              value={i.department}
            >
              {i.department}
            </Select.Option>
          ))}
        </SelectCustom>
      </Col>
    </>
  );
}
