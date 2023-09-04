import AntSelect from "antd/lib/select";
import styled from "styled-components/macro";
import { rgba } from "polished";

import { get } from "styles/utils";

export const Select = styled(AntSelect)`
  .ant-select-selection:hover {
    border-color: ${get("colors.accentSecondary")};
  }

  .ant-select-focused .ant-select-selection,
  .ant-select-selection:focus,
  .ant-select-selection:active,
  &.ant-select-open .ant-select-selection {
    border-color: ${get("colors.accentSecondary")};
    box-shadow: 0 0 0 2px ${rgba("#70bdc3", 0.2)};
  }

  .ant-select-arrow > * {
    line-height: 1;
  }

  .ant-select-arrow svg {
    display: inline-block;
  }

  .ant-select-selection-selected-value {
    .extra-info {
      display: none;
    }
  }
`;
