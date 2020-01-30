import 'styled-components/macro';
import React from 'react';

import { Row, Col } from '@components/Grid';
import Widget from './Widget';

export default function Reports({ widgets }) {

  return (
    <Row type="flex" gutter={[20, 20]}>
      {widgets.map(({ id, ...widget }) => (
        <Col key={id} span={24} md={12} lg={8}>
          <Widget css="height: 100%;" {...widget} id={id} />
        </Col>
      ))}
    </Row>
  );
}
