import AntInput from "antd/lib/input";
import styled from "styled-components/macro";
import { rgba } from "polished";

import { get } from "styles/utils";

export const Input = styled(AntInput)`
  &.ant-input:hover {
    border-color: ${get("colors.accentSecondary")};
  }

  &.ant-input:focus,
  &.ant-input:active {
    border-color: ${get("colors.accentSecondary")};
    box-shadow: 0 0 0 2px ${rgba("#70bdc3", 0.2)};
  }
`;

export const InputSearchNumber = styled(Input.Search)`
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type="number"] {
    -moz-appearance: textfield; /* Firefox */
  }
`;
