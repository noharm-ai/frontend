import styled from 'styled-components/macro';

import { get } from '@styles/utils';

export const Box = styled.div`
  border-top: 1px solid ${get('colors.detail')};
  padding: 20px 0;
`;
