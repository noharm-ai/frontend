import React, { useContext } from "react";
import { useTranslation } from "react-i18next";

import { Select } from "components/Inputs";
import Heading from "components/Heading";
import { Col } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";

export default function MainFilters({ segments, hospitals }) {
  const { t } = useTranslation();
  const { values, setFieldValue } = useContext(AdvancedFilterContext);

  const filterOption = (input, option) =>
    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;

  return (
    <>
      <Col md={6}>
        <Heading as="label" htmlFor="segments" size="16px" margin="0 10px 0 0">
          {t("screeningList.segment")}:
        </Heading>
        <Select
          id="idSegment"
          name="idSegment"
          style={{ width: "100%" }}
          placeholder="Selecione um segmento..."
          loading={segments.isFetching}
          value={values.idSegment}
          onChange={(val) => setFieldValue({ idSegment: val })}
          showSearch
          filterOption={filterOption}
        >
          {segments.list.map(({ id, description: text }) => (
            <Select.Option key={id} value={id}>
              {text}
            </Select.Option>
          ))}
        </Select>
      </Col>
      <Col md={6}>
        <Heading
          as="label"
          htmlFor="idHospital"
          size="16px"
          margin="0 10px 0 0"
        >
          Hospital:
        </Heading>
        <Select
          id="idHospital"
          name="idHospital"
          style={{ width: "100%" }}
          value={values.idHospital}
          onChange={(val) => setFieldValue({ idHospital: val })}
          showSearch
          filterOption={filterOption}
        >
          {hospitals.map(({ id, name }) => (
            <Select.Option key={id} value={id}>
              {name}
            </Select.Option>
          ))}
        </Select>
      </Col>
    </>
  );
}
