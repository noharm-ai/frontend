import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import moment from "moment";

import { RangeDatePicker, Input } from "components/Inputs";
import Heading from "components/Heading";
import { Col } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";

export default function MainFilters() {
  const { t, i18n } = useTranslation();
  const { values, setFieldValue } = useContext(AdvancedFilterContext);

  const onChangeDates = (value) => {
    const startDate = value[0] ? moment(value[0]).format("YYYY-MM-DD") : null;
    const endDate = value[1] ? moment(value[1]).format("YYYY-MM-DD") : null;
    setFieldValue({
      startDate,
      endDate,
    });
  };

  return (
    <>
      <Col md={7} lg={7} xxl={5}>
        <Heading as="label" htmlFor="date" size="14px">
          {t("labels.interventionDate")}:
        </Heading>
        <RangeDatePicker
          format="DD/MM/YYYY"
          value={[
            values.startDate ? moment(values.startDate) : null,
            values.endDate ? moment(values.endDate) : null,
          ]}
          onChange={onChangeDates}
          popupClassName="noArrow"
          allowClear={false}
          language={i18n.language}
        />
      </Col>
      <Col md={7} lg={3} xxl={3}>
        <Heading as="label" htmlFor="date" size="14px">
          {t("labels.admissionNumber")}:
        </Heading>
        <Input
          value={values.admissionNumber}
          onChange={({ target }) =>
            setFieldValue({ admissionNumber: target.value })
          }
        />
      </Col>
    </>
  );
}
