import React from 'react';

import Icon from '@components/Icon';
import Button from '@components/Button';
import Heading from '@components/Heading';
import { Wrapper, Excerpt } from './Widget.style';

export default function Widget({ id, reportData, showReport, ...props }) {
  return (
    <Wrapper id={id} {...props}>
      {reportData.icon && (
        <Icon type={reportData.icon} style={{ fontSize: 28, color: '#7ebe9a' }} />
      )}
      <Heading as="h4" size="16px" margin="18px 0 15px">
        {reportData.title}
      </Heading>
      <Excerpt margin="0 0 30px">{reportData.description}</Excerpt>
      <Button type="primary gtm-bt-view-report" onClick={() => showReport(reportData)}>
        Visualizar
      </Button>
    </Wrapper>
  );
}
