import styled, { css } from "styled-components";

import colors from "styles/colors";

export const TogglePill = styled.button<{ $active: boolean }>`
  align-items: center;
  background: ${colors.commonLighter};
  border: 1px solid rgba(112, 189, 195, 0.6);
  border-radius: 16px;
  color: ${colors.primary};
  cursor: pointer;
  display: flex;
  font-size: 13px;
  font-weight: 500;
  gap: 6px;
  line-height: 1;
  margin-right: 8px;
  padding: 7px 14px;
  transition:
    background 0.2s,
    color 0.2s;
  white-space: nowrap;

  &:hover,
  &:focus-visible {
    background: rgba(112, 189, 195, 0.14);
    outline: none;
  }

  ${({ $active }) =>
    $active &&
    css`
      background: ${colors.accentSecondary};
      border-color: ${colors.accentSecondary};
      color: ${colors.commonLighter};

      &:hover,
      &:focus-visible {
        background: ${colors.accentSecondary};
        filter: brightness(0.95);
      }
    `}

  .pill-label {
    display: none;

    @media (min-width: 992px) {
      display: inline;
    }
  }

  .pill-count {
    background: ${({ $active }) =>
      $active ? colors.commonLighter : colors.accentSecondary};
    border-radius: 10px;
    color: ${({ $active }) =>
      $active ? colors.accentSecondary : colors.commonLighter};
    font-size: 11px;
    padding: 2px 7px;
  }
`;
