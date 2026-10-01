import styled from "styled-components";

import colors from "styles/colors";

import { helpModeColors } from "../helpModeColors";

// same footprint as the notifications bell next to it (InfoAlert)
export const TriggerButton = styled.button`
  display: flex;
  align-items: center;
  padding: 10px 10px 10px 14px;
  border: 0;
  background: none;
  color: ${colors.primary};
  cursor: pointer;
  transition: background 0.2s;

  &:hover,
  &:focus-visible {
    background: rgba(0, 0, 0, 0.04);
    outline: none;
  }

  .anticon {
    font-size: 24px;
  }

  /* help mode on */
  .ant-badge-dot {
    background: ${helpModeColors.strong};
  }
`;
