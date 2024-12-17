import React, { useContext } from "react";
import { useSelector } from "react-redux";

import {
  RangeDatePicker,
  Select,
  SelectCustom,
  Input,
} from "components/Inputs";
import Heading from "components/Heading";
import { Col } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";

export default function MainFilters() {
  const types = useSelector(
    (state) => state.reportsArea.examsRawSearch.filterData.types
  );
  const status = useSelector(
    (state) => state.reportsArea.examsRawSearch.status
  );
  const { values, setFieldValue } = useContext(AdvancedFilterContext);

  return (
    <>
      <Col md={7} lg={5} xxl={5}>
        <Heading as="label" size="14px">
          Data do Exame:
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
        <Heading as="label" size="14px">
          Resultado:
        </Heading>
        <Input
          placeHolder={"Ex: 0.6"}
          style={{ width: "100%", maxWidth: "400px" }}
          onChange={(event) => {
            setFieldValue({ valueString: event.target.value });
          }}
          allowClear
          maxLength={10}
        ></Input>
      </Col>
      <Col md={7} lg={5} xxl={5}>
        <Heading as="label" size="14px">
          Tipo:
        </Heading>
        <SelectCustom
          style={{ width: "100%", maxWidth: "700px" }}
          value={values.typesList}
          onChange={(val) => setFieldValue({ typesList: val })}
          showSearch
          optionFilterProp="children"
          mode="multiple"
          allowClear
          maxTagCount="responsive"
          loading={status === "loading"}
          autoClearSearchValue={false}
          onSelectAll={() =>
            setFieldValue({
              typesList: types,
            })
          }
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
