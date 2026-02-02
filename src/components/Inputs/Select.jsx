import AntSelect from "antd/lib/select";
import styled from "styled-components";
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

  .ant-select-selection-item {
    .extra-info {
      display: none;
    }
  }
`;

export const SelectMultiline = styled(Select)`
  height: 60px;

  .ant-select-content {
    align-self: self-end !important;
  }

  .ant-select-selection-item,
  .ant-select-content {
    display: flex;
    flex-direction: column;
    line-height: 1.3 !important;
    align-items: flex-start;
    text-align: left;

    .extra-info {
      display: block;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      max-width: 500px;
    }

    br {
      display: none;
    }
  }
`;
