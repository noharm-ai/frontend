import styled, { css } from "styled-components";

import { get } from "styles/utils";
import { highContrastTokens } from "styles/highContrast";

export const Item = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 5px;
  border: 1px solid
    ${(props) => (props.$alert ? "#F68C97" : get("colors.detail")(props))};
  border-radius: 5px;
  background: ${(props) => (props.$alert ? "#F8DEE2" : "#fff")};

  .name {
    flex: 1;
    font-size: 14px;
    font-weight: 400;
    color: var(--nh-text-color);
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  .icon {
    position: relative;
    display: flex;
    justify-content: flex-end;
    align-items: center;

    > span {
      display: ${(props) => (props.$siderCollapsed ? "inline" : "none")};
      font-size: 12px;
      margin-right: 5px;
      color: var(--nh-text-color);

      @media only screen and (min-width: 1440px) {
        display: inline;
      }
    }
  }

  &:hover {
    box-shadow: 0px 1px 4px 0px rgb(0 0 0 / 16%);
  }

  /* High contrast preference: an out-of-range exam is told apart by a thick
  dark border, not only by its pink fill (the padding absorbs the extra
  border width). */
  ${({ theme, $alert }) =>
    theme.highContrast &&
    $alert &&
    css`
      border: 2px solid ${highContrastTokens.colorError};
      padding: 4px;
    `}
`;
