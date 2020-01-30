import styled from 'styled-components/macro';

import { get } from '@styles/utils';

export const Footer = styled.div`
  border-top: 1px solid ${get('colors.detail')};
  margin-top: 20px;
  padding: 20px 10px;
  text-align: right;

  .ant-btn {
    margin-left: 15px;
  }
`;
