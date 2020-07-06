import React from 'react';

import Icon from '@components/Icon';
import Heading from '@components/Heading';
import Tooltip from '@components/Tooltip';
import { Wrapper, Excerpt } from './Widget.style';

export default function Widget({ id, reportData, showReport, ...props }) {
  return (
    <Tooltip title="Visualizar">
      <Wrapper id={id} {...props} onClick={() => showReport(reportData)}>
        {reportData.icon && (
          <Icon type={reportData.icon} style={{ fontSize: 28, color: '#7ebe9a' }} />
        )}
        <Heading as="h4" size="16px" margin="18px 0 15px" textAlign="center">
          {reportData.title}
        </Heading>

        <Excerpt margin="0 0 30px">{reportData.description}</Excerpt>
      </Wrapper>
    </Tooltip>
  );
}
