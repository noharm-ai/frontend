import React, { useContext } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import { RangeDatePicker, Select } from "components/Inputs";
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
    (state) => state.reportsArea.intervention.departments
  );
  const segments = useSelector(
    (state) => state.reportsArea.intervention.segments
  );
  const status = useSelector((state) => state.reportsArea.intervention.status);
  const reportDate = useSelector(
    (state) => state.reportsArea.intervention.updatedAt
  );
  const { values, setFieldValue } = useContext(AdvancedFilterContext);

  return (
    <>
      <Col md={7} lg={5} xxl={5}>
        <Heading as="label" size="14px">
          {t("tableHeader.period")}:
        </Heading>
        <RangeDatePicker
          presets={getDateRangePresets(reportDate)}
          disabledDate={dateRangeValid(reportDate)}
          format="DD/MM/YYYY"
          value={values.dateRange}
          onChange={(val) => setFieldValue({ dateRange: val })}
          popupClassName="noArrow"
          allowClear={false}
          style={{ width: "100%" }}
        />
      </Col>
      <Col md={7} lg={5} xxl={5}>
        <Heading as="label" size="14px">
          Segmento:
        </Heading>
        <Select
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
        </Select>
      </Col>
      <Col md={7} lg={5} xxl={5}>
        <Heading as="label" size="14px">
          Setor:
        </Heading>
        <Select
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
            <Select.Option key={i.department} value={i.department}>
              {i.department}
            </Select.Option>
          ))}
        </Select>
      </Col>
    </>
  );
}
