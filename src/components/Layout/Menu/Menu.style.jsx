import { Menu } from "antd";
import styled from "styled-components";

export const Wrapper = styled(Menu)`
  &.ant-menu {
    background: transparent;
    border: 0;
  }

  .ant-menu-submenu-selected {
    color: #70bdc3 !important;
  }

  .ant-menu-title-content {
    font-weight: 500;
  }
`;
