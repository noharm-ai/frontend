import styled from 'styled-components/macro';

import { get } from '@styles/utils';

export const Box = styled.div`
  border-top: 1px solid ${get('colors.detail')};
  padding: 10px 0;

  label.fixed {
    width: 20%;
  }
`;

export const EditorBox = styled.div`
  .ck-content {
    min-height: 100px;
  }
`;
