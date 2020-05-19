import React from 'react';
import styled from 'styled-components';
import 'antd/lib/popover/style/index.css';
import { Popover } from 'antd';
import { PopoverProps } from 'antd/lib/popover';

const WrappedPopover = (props: PopoverProps) => {
  return <Popover {...props} overlayClassName={props.className} />;
}

const PopoverStyled = styled(WrappedPopover)`

  .ant-popover-content, .ant-popover-title, .ant-popover-inner-content {
    background-color: rgba(0, 0, 0, 0.75);
    color: #fff;
    border-radius: 4px;
  }

`;

export default PopoverStyled;