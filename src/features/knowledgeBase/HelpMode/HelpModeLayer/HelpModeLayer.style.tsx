import styled, { css } from "styled-components";

import colors from "styles/colors";

import { helpModeColors, helpModeTint } from "../helpModeColors";
import { breakpointsEnum } from "styles/breakpoints";

const mobile = `@media (max-width: ${breakpointsEnum.md - 1}px)`;

// above antd modals and drawers (1000), below messages and notifications
export const HELP_LAYER_Z_INDEX = 1050;

export const LayerRoot = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${HELP_LAYER_Z_INDEX};
  pointer-events: none;

  > * {
    pointer-events: auto;
  }
`;

const box = css`
  position: fixed;
  border-radius: 6px;
  box-sizing: border-box;
`;

export const HighlightBox = styled.div<{ $open: boolean; $aside: boolean }>`
  ${box}
  z-index: 1;
  border: 2px solid ${helpModeColors.strong};
  background: ${helpModeTint(0.14)};
  box-shadow: 0 0 0 3px ${helpModeTint(0.22)};
  cursor: help;
  transition:
    background 0.15s ease,
    box-shadow 0.15s ease;

  ${({ $open }) =>
    $open &&
    css`
      background: ${helpModeTint(0.24)};
      box-shadow: 0 0 0 5px ${helpModeTint(0.3)};
    `}

  &:hover,
  &:focus-visible {
    background: ${helpModeTint(0.24)};
    outline: none;
  }

  /* stepped aside: an outline only, and the clicks go through */
  ${({ $aside }) =>
    $aside &&
    css`
      &,
      &:hover {
        border-style: dashed;
        background: none;
        box-shadow: none;
        pointer-events: none;
      }

      .help-badge {
        opacity: 0.5;
      }
    `}

  .help-badge {
    position: absolute;
    top: -10px;
    right: -10px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 5px;
    border-radius: 10px;
    background: ${helpModeColors.strong};
    color: ${colors.commonLighter};
    font-size: 11px;
    font-weight: 600;
    box-shadow: 0 1px 3px rgba(46, 60, 90, 0.3);
  }
`;

export const PickerSurface = styled.div`
  position: fixed;
  inset: 0;
  z-index: 2;
  cursor: crosshair;
`;

export const PickerBox = styled.div<{ $fragile: boolean }>`
  ${box}
  z-index: 3;
  pointer-events: none;
  border: 2px dashed
    ${({ $fragile }) => ($fragile ? colors.danger : colors.primary)};
  background: ${({ $fragile }) =>
    $fragile ? "rgba(228, 102, 102, 0.12)" : "rgba(46, 60, 90, 0.1)"};

  .picker-caption {
    position: absolute;
    left: -2px;
    bottom: 100%;
    max-width: 480px;
    margin-bottom: 4px;
    padding: 2px 8px;
    overflow: hidden;
    border-radius: 4px;
    background: ${({ $fragile }) =>
      $fragile ? colors.danger : colors.primary};
    color: ${colors.commonLighter};
    font-family: monospace;
    font-size: 11px;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &.caption-below .picker-caption {
    top: 100%;
    bottom: auto;
    margin: 4px 0 0;
  }
`;

// height of the bar, published by HelpModeBar while it is shown so the app
// can make room for it above the header
export const HELP_BAR_HEIGHT_VAR = "--nh-help-bar-height";

export const Bar = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 4;
  /* the text centered on the screen, whatever the width of the actions:
     two equal side columns, the actions in the right one */
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 12px;
  min-height: 44px;
  padding: 6px 16px;
  /* the highlights' lavender, unlike anything in the app's chrome: a mode
     the user is in */
  background: ${helpModeColors.base};
  color: ${helpModeColors.text};
  box-shadow: 0 2px 8px ${helpModeTint(0.45)};

  ${mobile} {
    grid-template-columns: 1fr;
    row-gap: 6px;
  }

  .bar-text {
    grid-column: 2;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 4px 12px;
    text-align: center;

    ${mobile} {
      grid-column: 1;
    }
  }

  .bar-title {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    white-space: nowrap;
  }

  .bar-hint {
    color: ${helpModeColors.text};
    font-size: 13px;
  }

  .bar-actions {
    grid-column: 3;
    justify-self: end;
    display: flex;
    gap: 8px;

    ${mobile} {
      grid-column: 1;
      justify-self: center;
    }
  }
`;

export const PopoverBody = styled.div`
  width: 320px;
  max-width: calc(100vw - 48px);

  .popover-label {
    margin: 0 0 8px;
    color: ${colors.primary};
    font-size: 14px;
    font-weight: 600;
  }

  ul {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-height: 320px;
    margin: 0;
    padding: 0;
    overflow-y: auto;
    list-style: none;
  }

  li {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .popover-article {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
    width: 100%;
    padding: 8px 10px;
    border: 0;
    border-radius: 8px;
    background: none;
    text-align: left;
    cursor: pointer;

    strong {
      color: ${colors.primary};
      font-size: 13px;
      font-weight: 600;
    }

    span {
      display: -webkit-box;
      overflow: hidden;
      color: ${colors.text};
      font-size: 12px;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    &:hover,
    &:focus-visible {
      background: ${helpModeTint(0.14)};
      outline: none;
    }
  }

  .popover-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid ${colors.detail};
  }

  .popover-footer-actions {
    display: flex;
    align-items: center;
    gap: 4px;
  }
`;

export const HiddenList = styled.ul`
  width: 340px;
  max-width: calc(100vw - 48px);
  max-height: 320px;
  margin: 8px 0 0;
  padding: 0;
  overflow-y: auto;
  list-style: none;

  button {
    display: flex;
    flex-direction: column;
    gap: 2px;
    width: 100%;
    padding: 6px 8px;
    border: 0;
    border-radius: 6px;
    background: none;
    text-align: left;
    cursor: pointer;

    &:hover,
    &:focus-visible {
      background: ${helpModeTint(0.14)};
      outline: none;
    }
  }

  strong {
    color: ${colors.primary};
    font-size: 13px;
  }

  code {
    overflow: hidden;
    color: ${colors.text};
    font-size: 11px;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
`;
