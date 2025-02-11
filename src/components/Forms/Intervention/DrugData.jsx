import "styled-components";
import React from "react";
import { useTranslation } from "react-i18next";

import { Row, Col } from "components/Grid";

import Heading from "components/Heading";
import { FormHeader } from "components/Forms/Form.style";

export default function DrugData({ item }) {
  const { t } = useTranslation();
  const { drug, dosage, frequency, route } = item;

  return (
    <FormHeader>
      <Row type="flex" gutter={24} css="padding: 2px 0">
        <Col span={8}>
          <Heading as="p" $size="14px">
            {t("tableHeader.drug")}:
          </Heading>
        </Col>
        <Col span={24 - 8}>{drug}</Col>
      </Row>
      <Row type="flex" gutter={24} css="padding: 2px 0">
        <Col span={8}>
          <Heading as="p" $size="14px">
            {t("tableHeader.dose")}:
          </Heading>
        </Col>
        <Col span={24 - 8}>{dosage}</Col>
      </Row>
      <Row type="flex" gutter={24} css="padding: 2px 0">
        <Col span={8}>
          <Heading as="p" $size="14px">
            {t("tableHeader.frequency")}:
          </Heading>
        </Col>
        <Col span={24 - 8}>
          {frequency && `${frequency.value} ${frequency.label}`}
        </Col>
      </Row>
      <Row type="flex" gutter={24} css="padding: 2px 0">
        <Col span={8}>
          <Heading as="p" $size="14px">
            {t("tableHeader.route")}:
          </Heading>
        </Col>
        <Col span={24 - 8}>{route}</Col>
      </Row>
    </FormHeader>
  );
}
