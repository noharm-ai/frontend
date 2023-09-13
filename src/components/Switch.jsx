import AntSwitch from "antd/lib/switch";
import styled from "styled-components";

import { get } from "styles/utils";

const Switch = styled(AntSwitch)`
  &.ant-switch-checked {
    background-color: ${get("colors.accent")};
  }
`;

export default Switch;
