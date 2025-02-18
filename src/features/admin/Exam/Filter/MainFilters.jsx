import React, { useContext } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import { Select } from "components/Inputs";
import Heading from "components/Heading";
import { Col } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";

export default function MainFilters() {
  const { t } = useTranslation();
  const segments = useSelector((state) => state.segments.list);
  const { values, setFieldValue } = useContext(AdvancedFilterContext);

  return (
    <>
      <Col md={6}>
        <Heading as="label" htmlFor="segments" $size="16px">
          {t("screeningList.segment")}:
        </Heading>
        <Select
          id="idSegment"
          name="idSegment"
          style={{ width: "100%" }}
          placeholder="Selecione um segmento..."
          value={values.idSegment}
          onChange={(val) => setFieldValue({ idSegment: val })}
          showSearch
        >
          {segments.map(({ id, description: text }) => (
            <Select.Option key={id} value={id}>
              {text}
            </Select.Option>
          ))}
        </Select>
      </Col>
    </>
  );
}
