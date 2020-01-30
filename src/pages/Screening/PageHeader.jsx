import 'styled-components/macro';
import React, { useEffect } from 'react';
import isEmpty from 'lodash.isempty';

import Icon from '@components/Icon';
import Heading from '@components/Heading';
import Button, { Link } from '@components/Button';
import { Row, Col } from '@components/Grid';
import notification from '@components/notification';

// extract idPrescription from slug.
const extractId = slug => slug.match(/([0-9]+)$/)[0];
// error message when fetch has error.
const errorMessage = {
  message: 'Ops! Algo de errado aconteceu.',
  description: 'Aconteceu algo que nos impediu de lhe mostrar os dados, por favor, tente novamente.'
};

export default function PageHeader({ match, pageTitle, prescription, checkScreening }) {
  const id = parseInt(extractId(match.params.slug));
  const { isChecking, error, success } = prescription.check;

  // show message if has error
  useEffect(() => {
    if (!isEmpty(error)) {
      notification.error(errorMessage);
    }
  }, [error]);

  return (
    <Row type="flex" css="margin-bottom: 30px;">
      <Col span={24} md={16}>
        <Heading>{pageTitle}</Heading>
      </Col>
      <Col
        span={24}
        md={24 - 16}
        css="
          text-align: right;

          @media(max-width: 992px) {
            text-align: left;
          }
        "
      >
        <Link href="/" type="secondary" css="margin-right: 10px;">
          Lista de pacientes
        </Link>
        <Button type="primary" onClick={() => checkScreening(id)} loading={isChecking}>
          {!isEmpty(success) && success.id === id && <Icon type="check" />}
          {!isEmpty(success) && success.id === id ? 'Checado' : 'Checar'}
        </Button>
      </Col>
    </Row>
  );
}
