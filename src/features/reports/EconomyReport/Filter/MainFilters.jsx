import React, { useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { HistoryOutlined } from "@ant-design/icons";

import { RangeDatePicker, Select, SelectCustom } from "components/Inputs";
import Heading from "components/Heading";
import { Col } from "components/Grid";
import Button from "components/Button";
import { AdvancedFilterContext } from "components/AdvancedFilter";
import {
  getDateRangePresets,
  dateRangeValid,
  getFilterDepartment,
} from "utils/report";
import { setHistoryModal } from "../EconomyReportSlice";

export default function MainFilters() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const departments = useSelector(
    (state) => state.reportsArea.economy.departments
  );
  const segments = useSelector((state) => state.reportsArea.economy.segments);
  const status = useSelector((state) => state.reportsArea.economy.status);
  const reportDate = useSelector((state) => state.reportsArea.economy.date);
  const reportDateRange = useSelector(
    (state) => state.reportsArea.economy.dateRange
  );
  const { values, setFieldValue } = useContext(AdvancedFilterContext);

  const showHistory = () => {
    document.querySelector(".ant-picker-presets li:nth-child(2)").click();

    dispatch(setHistoryModal(true));
  };

  return (
    <>
      <Col md={7} lg={5} xxl={5}>
        <Heading as="label" $size="14px">
          {t("tableHeader.period")}:
        </Heading>
        <RangeDatePicker
          presets={getDateRangePresets(reportDate)}
          disabledDate={dateRangeValid(reportDate, reportDateRange)}
          format="DD/MM/YYYY"
          value={values.dateRange}
          onChange={(val) => setFieldValue({ dateRange: val })}
          popupClassName="noArrow"
          allowClear={false}
          style={{ width: "100%" }}
          renderExtraFooter={() => (
            <Button
              icon={<HistoryOutlined />}
              style={{ margin: "10px 0" }}
              onClick={() => showHistory()}
            >
              Ver períodos anteriores
            </Button>
          )}
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
