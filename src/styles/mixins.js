import { css, keyframes } from 'styled-components/macro';

export const loadingCircle = keyframes`
  100% {
    transform: rotate(360deg);
  }
`;

export const resetBoxMixin = css`
  background: transparent;
  border: 0;
  margin: 0;
  padding: 0;
`;

export const cutTextMixin = css`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
