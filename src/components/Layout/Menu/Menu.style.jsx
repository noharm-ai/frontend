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

  &.ant-menu-inline-collapsed {
    .ant-menu-item {
      padding: 0 !important;
    }

    .nav-text {
      width: 75px;
      text-align: center;
    }
  }

  .ant-menu-submenu-selected {
    color: #70bdc3 !important;
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

Wrapper.SubMenu = styled(AntMenu.SubMenu)`
  color: ${get('colors.commonLighter')};
  font-weight: ${get('weight.light')};

  .ant-menu {
    background-color: transparent !important;
  }

  .ant-menu-submenu-active,
  .ant-menu-submenu-title:hover {
    color: #70bdc3;
  }

  &.ant-menu-submenu-selected .ant-menu-submenu-arrow::before,
  &.ant-menu-submenu-selected .ant-menu-submenu-arrow::after,
  .ant-menu-submenu-title:hover .ant-menu-submenu-arrow::before,
  .ant-menu-submenu-title:hover .ant-menu-submenu-arrow::after {
    background: linear-gradient(to right, #70bdc3, #70bdc3) !important;
  }

  .ant-menu-submenu-arrow::after,
  .ant-menu-submenu-arrow::before {
    background-image: linear-gradient(
      to right,
      rgba(255, 255, 255, 1),
      rgba(255, 255, 255, 1)
    ) !important;
  }
`;
