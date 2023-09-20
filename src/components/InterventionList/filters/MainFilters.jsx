import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

import { RangeDatePicker, InputNumber, Select } from "components/Inputs";
import Heading from "components/Heading";
import { Col } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";

export default function MainFilters({ segments }) {
  const { t, i18n } = useTranslation();
  const { values, setFieldValue } = useContext(AdvancedFilterContext);

  const onChangeDates = (value) => {
    const startDate = value[0] ? dayjs(value[0]).format("YYYY-MM-DD") : null;
    const endDate = value[1] ? dayjs(value[1]).format("YYYY-MM-DD") : null;
    setFieldValue({
      startDate,
      endDate,
    });
  };

  return (
    <>
      <Col md={7} lg={6} xxl={4}>
        <Heading as="label" htmlFor="date" size="14px">
          {t("labels.interventionDate")}:
        </Heading>
        <RangeDatePicker
          format="DD/MM/YYYY"
          value={[
            values.startDate ? dayjs(values.startDate) : null,
            values.endDate ? dayjs(values.endDate) : null,
          ]}
          onChange={onChangeDates}
          popupClassName="noArrow"
          allowClear={false}
          language={i18n.language}
        />
      </Col>
      <Col md={7} lg={5} xxl={4}>
        <Heading as="label" htmlFor="date" size="14px">
          {t("patientCard.segment")}:
        </Heading>
        <Select
          id="segments"
          style={{ width: "100%" }}
          onChange={(idSegment) => setFieldValue({ idSegment })}
          value={values.idSegment}
          allowClear
        >
          {segments.map(({ id, description: text }) => (
            <Select.Option key={id} value={id}>
              {text}
            </Select.Option>
          ))}
        </Select>
      </Col>
      <Col md={7} lg={3} xxl={3}>
        <Heading as="label" htmlFor="date" size="14px">
          {t("labels.admissionNumber")}:
        </Heading>
        <InputNumber
          controls={false}
          value={values.admissionNumber}
          onChange={(value) => setFieldValue({ admissionNumber: value })}
        />
      </Col>
    </>
  );
}
