import styled from "styled-components";

import colors from "styles/colors";

import { helpModeColors, helpModeTint } from "../helpModeColors";

export const ActionCard = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
  padding: 12px 16px;
  border: 1px solid ${helpModeTint(0.5)};
  border-left: 4px solid ${helpModeColors.strong};
  border-radius: 8px;
  background: ${helpModeTint(0.1)};

  > .anticon {
    color: ${helpModeColors.strong};
    font-size: 26px;
  }

  .action-text {
    flex: 1;
    min-width: 0;
  }

  .action-title {
    color: ${colors.primary};
    font-weight: 600;
  }

  .action-hint {
    color: ${colors.text};
    font-size: 13px;
  }
`;
