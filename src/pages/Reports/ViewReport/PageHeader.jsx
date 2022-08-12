import "styled-components/macro";
import React from "react";
import isEmpty from "lodash.isempty";

import { Link } from "components/Button";
import Heading from "components/Heading";
import { Row, Col } from "components/Grid";

export default function PageHeader({ report }) {
  if (isEmpty(report)) {
    return null;
  }

  return (
    <Row type="flex" css="margin-bottom: 30px;">
      <Col span={16} sm={12} xs={24}>
        <Heading>Relatório: {report.title}</Heading>
        <p>{report.description}</p>
      </Col>
      <Col
        span={24 - 16}
        sm={12}
        xs={24}
        css="
          text-align: right;

          @media(max-width: 992px) {
            text-align: left;
          }
        "
      >
        <Link href="/relatorios">Voltar</Link>
      </Col>
    </Row>
  );
}
