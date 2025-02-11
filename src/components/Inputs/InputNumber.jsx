import React from "react";
import { useTranslation } from "react-i18next";
import antInputNumber from "antd/lib/input-number";
import styled from "styled-components";
import { rgba } from "polished";

import { get } from "styles/utils";

const StyledInputNumber = styled(antInputNumber)`
  &.ant-input-number {
    width: 100%;
  }

  &.ant-input-number:hover {
    border-color: ${get("colors.accentSecondary")};
  }

  &.ant-input-number-focused,
  &.ant-input-number:focus,
  &.ant-input-number:active {
    border-color: ${get("colors.accentSecondary")};
    box-shadow: 0 0 0 2px ${rgba("#70bdc3", 0.2)};
  }

  .ant-input-number-handler-wrap {
    opacity: 1;
  }
`;

export const InputNumber = (props) => {
  const { i18n } = useTranslation();

  return (
    <StyledInputNumber
      decimalSeparator={i18n.language === "en" ? "." : ","}
      {...props}
    />
  );
};
