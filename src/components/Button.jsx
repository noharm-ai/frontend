import 'antd/lib/button/style/index.css';
import React from 'react';
import styled, { css } from 'styled-components/macro';
import AntButton from 'antd/lib/button';
import { useHistory } from 'react-router-dom';

import { get } from '@styles/utils';

const Button = styled(AntButton)`
  ${({ type }) =>
    !type &&
    css`
      &:not([disabled]).ant-btn:hover,
      &:not([disabled]).ant-btn:focus {
        border-color: ${get('colors.accent')};
        color: ${get('colors.accent')};
      }
    `}

  &.ant-btn-primary {
    background-color: ${get('colors.accent')};
    border-color: ${get('colors.accent')};

    &:active,
    &:focus,
    &:hover {
      background-color: ${get('colors.accentSecondary')};
      border-color: ${get('colors.accentSecondary')};
    }
  }

  &.ant-btn-secondary {
    background-color: ${get('colors.accentSecondary')};
    border-color: ${get('colors.accentSecondary')};
    color: ${get('colors.commonLighter')};

    &:active,
    &:focus,
    &:hover {
      background-color: ${get('colors.accent')};
      border-color: ${get('colors.accent')};
      color: ${get('colors.commonLighter')};
    }
  }
`;

export const Link = ({ href, to, children, ...props }) => {
  const history = useHistory();

  return (
    <Button
      onClick={() => {
        history.push(href || to);
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

export default Button;
