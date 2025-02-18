import React, { useContext } from "react";
import { useSelector } from "react-redux";

import { RangeDatePicker, Select, SelectCustom } from "components/Inputs";
import Heading from "components/Heading";
import { Col } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";

export default function MainFilters() {
  const exams = useSelector(
    (state) => state.reportsArea.culture.filterData.exams
  );
  const materials = useSelector(
    (state) => state.reportsArea.culture.filterData.examMaterials
  );
  const microorganisms = useSelector(
    (state) => state.reportsArea.culture.filterData.microorganisms
  );
  const status = useSelector((state) => state.reportsArea.culture.status);
  const { values, setFieldValue } = useContext(AdvancedFilterContext);

  return (
    <>
      <Col md={7} lg={5} xxl={5}>
        <Heading as="label" $size="14px">
          Período de Coleta:
        </Heading>
        <RangeDatePicker
          format="DD/MM/YYYY"
          value={values.dateRange}
          onChange={(val) => setFieldValue({ dateRange: val })}
          popupClassName="noArrow"
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
          onChange={(val) => setFieldValue({ examNameList: val })}
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
          onChange={(val) => setFieldValue({ examMaterialNameList: val })}
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
          onChange={(val) => setFieldValue({ microorganismList: val })}
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
