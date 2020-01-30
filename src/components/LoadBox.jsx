import React from 'react';
import styled from 'styled-components/macro';

import Spin from '@components/Spin';

const Box = styled.div`
  align-items: center;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  display: flex;
  justify-content: center;
  height: 100%;
  text-align: center;
`;

const LoadBox = props => (
  <Box {...props}>
    <Spin />
  </Box>
);

export default LoadBox;
