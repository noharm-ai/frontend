import React from "react";
import styled from "styled-components";
import { Popover } from "antd";

const WrappedPopover = (props) => {
  return <Popover {...props} overlayClassName={props.className} />;
};

const PopoverStyled = styled(WrappedPopover)``;

export default PopoverStyled;
