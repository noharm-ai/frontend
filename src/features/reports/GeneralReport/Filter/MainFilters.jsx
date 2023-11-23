import React, { useContext } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import { RangeDatePicker, Select } from "components/Inputs";
import Heading from "components/Heading";
import { Col } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";

export default function MainFilters() {
  const { t } = useTranslation();
  const responsibles = useSelector(
    (state) => state.reportsArea.general.responsibles
  );
  const departments = useSelector(
    (state) => state.reportsArea.general.departments
  );
  const status = useSelector((state) => state.reportsArea.general.status);
  const { values, setFieldValue } = useContext(AdvancedFilterContext);

  return (
    <>
      <Col md={7} lg={5} xxl={5}>
        <Heading as="label" size="14px">
          {t("tableHeader.period")}:
        </Heading>
        <RangeDatePicker
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
          Responsável:
        </Heading>
        <Select
          style={{ width: "100%", maxWidth: "400px" }}
          value={values.responsibleList}
          onChange={(val) => setFieldValue({ responsibleList: val })}
          showSearch
          optionFilterProp="children"
          mode="multiple"
          allowClear
          maxTagCount="responsive"
          loading={status === "loading"}
        >
          {responsibles.map((i) => (
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
        >
          {departments.map((i) => (
            <Select.Option key={i} value={i}>
              {i}
            </Select.Option>
          ))}
        </Select>
      </Col>
    </>
  );
}
