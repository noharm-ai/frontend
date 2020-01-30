import 'antd/lib/menu/style/index.css';
import AntMenu from 'antd/lib/menu';
import styled from 'styled-components/macro';
import { linearGradient } from 'polished';

import { get } from '@styles/utils';

export const Wrapper = styled(AntMenu)`
  &.ant-menu {
    background: transparent;
    border: 0;
  }
`;

Wrapper.Item = styled(AntMenu.Item)`
  color: ${get('colors.commonLighter')};
  font-weight: ${get('weight.light')};

  &:before {
    content: '';
    height: 100%;
    left: 0;
    opacity: 0;
    position: absolute;
    top: 0;
    transition: opacity 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
    width: 100%;

    ${linearGradient({
      colorStops: ['#70bdc4 0%', '#7ebe9a 100%'],
      toDirection: 'to right',
      fallback: '#7ebe9a'
    })}
  }

  &:after {
    display: none;
  }

  &.ant-menu-item-selected,
  &.ant-menu-item:hover {
    color: ${get('colors.commonLighter')};

    &:before {
      opacity: 1;
    }
  }

  .nav-text {
    color: inherit;
    margin-left: 2px;
    position: relative;
    text-decoration: none;
    z-index: 1;
    overflow: hidden;

    &:hover {
      color: inherit;
    }
  }
`;
