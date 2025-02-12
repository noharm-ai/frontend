import { Input } from "antd";
import styled from "styled-components";
import { rgba } from "polished";

import { get } from "styles/utils";

export const Textarea = styled(Input.TextArea)`
  &.ant-input:hover {
    border-color: ${get("colors.accentSecondary")};
  }

  &.ant-input:focus,
  &.ant-input:active {
    border-color: ${get("colors.accentSecondary")};
    box-shadow: 0 0 0 2px ${rgba("#70bdc3", 0.2)};
  }
`;
