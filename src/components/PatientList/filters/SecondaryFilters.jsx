import React, { useContext } from "react";
import { useTranslation } from "react-i18next";

import Heading from "components/Heading";
import { Col, Row } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";
import UserSelect from "components/Forms/Fields/UserSelect";

export default function SecondaryFilters() {
  const { t } = useTranslation();
  const { values, setFieldValue } = useContext(AdvancedFilterContext);

  return (
    <Row gutter={[20, 20]}>
      <Col md={24} xl={18} xxl={14}>
        <Heading as="label" htmlFor="segments" size="14px">
          {t("labels.scheduledBy")}:
        </Heading>
        <UserSelect
          value={values.scheduledBy}
          onChange={(ids) => setFieldValue({ scheduledBy: ids })}
        />
      </Col>

      <Col md={24} xl={18} xxl={14}>
        <Heading as="label" htmlFor="segments" size="14px">
          {t("labels.attendedBy")}:
        </Heading>
        <UserSelect
          value={values.attendedBy}
          onChange={(ids) => setFieldValue({ attendedBy: ids })}
        />
      </Col>
    </Row>
  );
}
