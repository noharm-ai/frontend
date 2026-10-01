import styled, { css } from "styled-components";

import colors from "styles/colors";

import { helpModeColors, helpModeTint } from "../helpModeColors";

export const TogglePill = styled.button<{ $active: boolean }>`
  align-items: center;
  background: ${colors.commonLighter};
  border: 1px solid ${helpModeTint(0.6)};
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
    background: ${helpModeTint(0.14)};
    outline: none;
  }

  ${({ $active }) =>
    $active &&
    css`
      background: ${helpModeColors.base};
      border-color: ${helpModeColors.base};
      color: ${helpModeColors.text};

      &:hover,
      &:focus-visible {
        background: ${helpModeColors.base};
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
      $active ? helpModeColors.text : helpModeColors.strong};
    border-radius: 10px;
    color: ${({ $active }) =>
      $active ? helpModeColors.base : colors.commonLighter};
    font-size: 11px;
    padding: 2px 7px;
  }
`;
