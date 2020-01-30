import styled from 'styled-components/macro';

import { get } from '@styles/utils';
import Heading from '@components/Heading';

export const Wrapper = styled.div`
  border: 1px solid ${get('colors.detail')};
  border-radius: 6px;
  overflow: hidden;
`;

export const Name = styled(Heading)`
  color: ${get('colors.commonLighter')};
  background: ${get('colors.danger')};
  padding: 12.5px 15px;

  @media (max-width: 768px) {
    margin: 0;
  }
`;

export const Box = styled.div`
  align-items: center;
  border-top: 1px solid ${get('colors.detail')};
  display: flex;
  min-height: 40px;
  padding: 3.5px 15px;

  p {
    margin: 0;
  }
`;
