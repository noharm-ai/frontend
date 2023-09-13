import React from "react";
import styled from "styled-components/macro";
import AntTooltip from "antd/lib/tooltip";

const StyledTooltip = styled(AntTooltip)`
  ${({ underline }) => (underline ? "border-bottom: 2px dotted #999" : "")};
`;

const Tooltip = ({ children, ...props }) => (
  <StyledTooltip mouseLeaveDelay={0} {...props}>
    {children}
  </StyledTooltip>
);

export default Tooltip;
