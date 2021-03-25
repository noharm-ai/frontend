import React, { useEffect } from 'react';
import isEmpty from 'lodash.isempty';

import Empty from '@components/Empty';
import LoadBox from '@components/LoadBox';
import { Row, Col } from '@components/Grid';
import notification from '@components/notification';
import BackTop from '@components/BackTop';

import PageHeader from '@containers/Conciliation/PageHeader';
import Patient from '@containers/Screening/Patient';

import { BoxWrapper } from './index.style';

const errorMessage = {
  message: 'Ops! Algo de errado aconteceu.',
  description: 'Aconteceu algo que nos impediu de lhe mostrar os dados, por favor, tente novamente.'
};

export default function Screening({ match, fetchScreeningById, isFetching, error }) {
  const { id } = match.params;

  // show message if has error
  useEffect(() => {
    if (!isEmpty(error)) {
      notification.error(errorMessage);
    }
  }, [error]);

  // fetch data
  useEffect(() => {
    fetchScreeningById(id);
  }, [id, fetchScreeningById]);

  if (error) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={error.message}
        id="gtm-conciliation-error"
      />
    );
  }

  return (
    <>
      <BoxWrapper>
        <PageHeader match={{ params: { slug: id } }} />
        <Row type="flex" gutter={24}>
          <Col span={24} md={24}>
            {isFetching ? <LoadBox /> : <Patient />}
          </Col>
        </Row>
      </BoxWrapper>

      <Row type="flex" gutter={24} />

      <BackTop />
    </>
  );
}
