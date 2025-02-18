import React from "react";
import styled from "styled-components";
import Popover from "antd/lib/popover";

export default Popover;

const WrappedPopover = (props) => {
  return <Popover {...props} overlayClassName={props.className} />;
};

export const PopoverWelcome = styled(WrappedPopover)`
  .ant-popover-arrow {
    border-color: rgb(126, 190, 154) !important;
  }
  .ant-popover-title {
    background: linear-gradient(
        to right,
        rgb(112, 189, 196) 0%,
        rgb(126, 190, 154) 100%
      )
      rgb(126, 190, 154);
    color: #fff;
    font-weight: bold;
    font-size: 16px;
  }
`;
