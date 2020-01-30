import React, { useEffect } from 'react';
import isEmpty from 'lodash.isempty';

import message from '@components/message';
import Heading from '@components/Heading';
import { Row, Col } from '@components/Grid';
import { Select } from '@components/Inputs';
import { Box } from './Filter.style';

export default function Filter({ fetchPrescriptionsList, segments }) {
  useEffect(() => {
    if (!isEmpty(segments.error)) {
      message.error(segments.error.message);
    }
  }, [segments.error]);

  const handleChangeSegment = idSegment =>
    idSegment !== 'all' ? fetchPrescriptionsList({ idSegment }) : fetchPrescriptionsList();

  return (
    <div style={{ marginBottom: 25 }}>
      <Row>
        <Col span={24} md={11}>
          <Box>
            <Heading as="label" htmlFor="segments" size="16px" margin="0 10px 0 0">
              Segmento:
            </Heading>
            <Select
              id="segments"
              style={{ width: '100%' }}
              placeholder="Selectione um segmento..."
              loading={segments.isFetching}
              onChange={handleChangeSegment}
            >
              <Select.Option value="all">Todos os segmentos</Select.Option>
              {segments.list.map(({ id, description: text }) => (
                <Select.Option key={id} value={id}>
                  {text}
                </Select.Option>
              ))}
            </Select>
          </Box>
        </Col>
      </Row>
    </div>
  );
}
