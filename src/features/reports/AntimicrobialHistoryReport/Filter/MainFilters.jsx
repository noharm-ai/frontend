import React, { useContext } from "react";
import { useSelector } from "react-redux";

import { RangeDatePicker, Select, SelectCustom } from "components/Inputs";
import Heading from "components/Heading";
import { Col } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";

export default function MainFilters() {
  const drugs = useSelector(
    (state) => state.reportsArea.antimicrobialHistory.filterData.drugs
  );
  const substances = useSelector(
    (state) => state.reportsArea.antimicrobialHistory.filterData.substances
  );

  const status = useSelector(
    (state) => state.reportsArea.antimicrobialHistory.status
  );
  const { values, setFieldValue } = useContext(AdvancedFilterContext);

  return (
    <>
      <Col md={7} lg={5} xxl={5}>
        <Heading as="label" $size="14px">
          Data de Prescrição:
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
          Medicamento:
        </Heading>
        <SelectCustom
          style={{ width: "100%", maxWidth: "400px" }}
          value={values.drugList}
          onChange={(val) => setFieldValue({ drugList: val })}
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
          onChange={(val) => setFieldValue({ substanceList: val })}
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
