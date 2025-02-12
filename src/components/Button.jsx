import React from "react";
import styled, { css } from "styled-components";
import { Button as AntdButton } from "antd";
import { useNavigate } from "react-router-dom";
import { QuestionOutlined } from "@ant-design/icons";

import { get } from "styles/utils";

const Button = styled(AntdButton)`
  ${({ type }) =>
    !type &&
    css`
      &:not([disabled]).ant-btn:hover,
      &:not([disabled]).ant-btn:focus {
        border-color: ${get("colors.accent")};
        color: ${get("colors.accent")};
      }
    `}

  ${({ ghost }) =>
    !ghost &&
    css`
      &.ant-btn-primary {
        background-color: ${get("colors.accent")};
        border-color: ${get("colors.accent")};

        &:active,
        &:focus,
        &:hover {
          background-color: ${get("colors.accentSecondary")};
          border-color: ${get("colors.accentSecondary")};
        }

        &[disabled] {
          background-color: #f5f5f5;
          border-color: #d9d9d9;
        }
      }

      &.ant-btn-secondary {
        background-color: ${get("colors.accentSecondary")};
        border-color: ${get("colors.accentSecondary")};
        color: ${get("colors.commonLighter")};

        &:active,
        &:focus,
        &:hover {
          background-color: ${get("colors.accent")};
          border-color: ${get("colors.accent")};
          color: ${get("colors.commonLighter")};
        }

        &[disabled] {
          background-color: #f5f5f5;
          border-color: #d9d9d9;
        }
      }
    `}

  &.ant-btn-icon-only {
    width: 38px;
  }

  &.ant-btn-circle.ant-btn-icon-only {
    width: 32px;
  }

  &.ant-btn-link-active {
    span {
      text-decoration: underline;
    }
  }

  &.ant-btn-link-hover:hover {
    span {
      text-decoration: underline;
    }
  }
`;

export const Link = ({ href, to, children, target, ...props }) => {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => {
        if (target === "_blank") {
          window.open(href || to);
        } else {
          navigate(href || to);
        }
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

export const HelpButton = ({ href, type }) => {
  return (
    <Button
      type={type}
      ghost
      shape="circle"
      icon={<QuestionOutlined />}
      style={{
        width: "28px",
        height: "28px",
        minWidth: "28px",
        margin: "0 5px",
      }}
      onClick={() => {
        window.open(href);
      }}
    />
  );
};

export const BasicButton = AntdButton;

export default Button;
