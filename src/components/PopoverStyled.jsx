import React from "react";
import styled from "styled-components";
import { Popover } from "antd";
import { PopoverProps } from "antd/lib/popover";

const WrappedPopover = (props: PopoverProps) => {
  return <Popover {...props} overlayClassName={props.className} />;
};

const PopoverStyled = styled(WrappedPopover)``;

export default PopoverStyled;
