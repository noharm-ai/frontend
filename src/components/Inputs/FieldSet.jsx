import styled from 'styled-components/macro';

import { get } from '@styles/utils';

export const FieldSet = styled.div`
  margin-bottom: 18px;

  &.has-error .ant-input,
  &.has-error .ant-input:hover {
    border-color: #f5222d !important;
  }

  &.has-error .ant-input:focus {
    border-color: #f5222d;
    box-shadow: 0 0 0 2px rgba(245, 34, 45, 0.2);
    outline: 0;
  }

  .ant-checkbox-wrapper {
    color: ${get('colors.commonLighter')};
  }
`;
