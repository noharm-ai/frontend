import { Layout } from "antd";
import styled from "styled-components/macro";

import { get } from "styles/utils";
import { ReactComponent as LogoSVG } from "assets/noHarm-horizontal.svg";

export const MessageLink = styled.a`
  color: rgba(0, 0, 0, 0.85);
  text-decoration: none;
  transition: color 0.3s;

  &:hover {
    color: rgba(0, 0, 0, 0.65);
  }
`;

export const Brand = styled(LogoSVG)`
  display: block;
  min-width: 164px;
  max-width: 164px;
  width: 100%;
  // filter: hue-rotate(150deg); // outubro rosa
  pointer-events: none;
`;

export const UserName = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: 20px;
  align-items: flex-start;
  justify-content: center;

  .name {
    color: ${get("colors.primary")};
    font-weight: 400;
    line-height: 1;
  }

  .schema {
    line-height: 1;
    margin-top: 3px;
  }
`;

export const LogOut = styled.button`
  color: ${get("colors.primary")};
  cursor: pointer;
  font-weight: ${get("weight.bold")};
  transition: color 0.3s ease;
  text-decoration: none;
  border: 0;
  background: #fff;

  &:hover {
    color: ${get("colors.accent")};
  }
`;

export const Wrapper = styled(Layout)`
  &.ant-layout {
    background: #eff1f4;
    transition: all 0.2s;
  }
`;

Wrapper.Footer = styled(Layout.Footer)`
  &.ant-layout-footer {
    color: #888;
    font-size: 16px;
    font-weight: ${get("weight.light")};
    text-align: center;
  }
`;

Wrapper.Sider = styled(Layout.Sider)`
  &.ant-layout-sider {
    background: ${get("colors.primary")};
    color: #fff;
    height: 100vh;
    left: 0;
    padding: 15px 0;
    z-index: 2;
    position: fixed;
  }

  .ant-layout-sider-zero-width-trigger {
    background: ${get("colors.primary")};
    top: 10px;
  }

  &.ant-layout-sider-collapsed {
    .brand {
      height: 38px;
      width: auto;
      margin-left: 6px;
    }
    .cls-1 {
      width: 100%;
    }
    .cls-2 {
      display: none;
    }
  }
`;

Wrapper.Header = styled(Layout.Header)`
  align-items: center;
  display: flex;
  width: 100%;

  &.ant-layout-header {
    background: ${get("colors.commonLighter")};
    padding: 20px;
  }

  .controls {
    display: flex;
    align-items: center;
  }
`;
