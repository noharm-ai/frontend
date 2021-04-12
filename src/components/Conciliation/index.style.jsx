import styled from 'styled-components/macro';

import { get } from '@styles/utils';

export const BoxWrapper = styled.section`
  background: ${get('colors.commonLighter')};
  border-radius: 4px;
  box-shadow: 3px 0px 4px rgba(4, 0, 6, 0.15);
  padding: 25px;
`;
