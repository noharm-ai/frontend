import 'antd/lib/input-number/style/index.css';
import antInputNumber from 'antd/lib/input-number';
import styled from 'styled-components/macro';
import { rgba } from 'polished';

import { get } from '@styles/utils';

export const InputNumber = styled(antInputNumber)`
  &.ant-input-number {
    width: 100%;
  }

  &.ant-input-number:hover {
    border-color: ${get('colors.accentSecondary')};
  }

  &.ant-input-number-focused,
  &.ant-input-number:focus,
  &.ant-input-number:active {
    border-color: ${get('colors.accentSecondary')};
    box-shadow: 0 0 0 2px ${rgba('#70bdc3', 0.2)};
  }
`;
