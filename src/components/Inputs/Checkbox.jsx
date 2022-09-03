import "antd/lib/checkbox/style/index.css";
import AntCheckbox from "antd/lib/checkbox";
import styled from "styled-components/macro";

import { get } from "styles/utils";

export const Checkbox = styled(AntCheckbox)`
  &.ant-checkbox-wrapper:hover .ant-checkbox-inner,
  .ant-checkbox:hover .ant-checkbox-inner,
  .ant-checkbox-input:focus + .ant-checkbox-inner {
    border-color: ${get("colors.accentSecondary")};
  }

  .ant-checkbox-checked .ant-checkbox-inner {
    background-color: ${get("colors.accentSecondary")};
    border-color: ${get("colors.accentSecondary")};
  }

  .ant-checkbox-checked::after {
    border-color: ${get("colors.accentSecondary")};
  }
`;
