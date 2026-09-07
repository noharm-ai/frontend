import AntCheckbox from "antd/lib/checkbox";
import styled from "styled-components";

import { get } from "styles/utils";

export const Checkbox = styled(AntCheckbox)`
  &.ant-checkbox-wrapper:hover .ant-checkbox,
  .ant-checkbox:hover,
  .ant-checkbox:has(.ant-checkbox-input:focus) {
    border-color: ${get("colors.accentSecondary")};
  }

  .ant-checkbox-checked {
    background-color: ${get("colors.accentSecondary")};
    border-color: ${get("colors.accentSecondary")};
  }
`;
