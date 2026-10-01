import styled from "styled-components";

import colors from "styles/colors";
import {
  helpModeColors,
  helpModeTint,
} from "features/knowledgeBase/HelpMode/helpModeColors";

const card = `
  position: relative;
  overflow: hidden;
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 20px;
`;

export const AIAgentCard = styled.section`
  ${card}
  /* same palette as the knowledge base hero */
  background: linear-gradient(135deg, #eef6f5 0%, #f7faf9 100%);
  border: 1px solid #dcebe8;

  &::after {
    content: "";
    position: absolute;
    right: -48px;
    top: -48px;
    width: 140px;
    height: 140px;
    border-radius: 50%;
    background: linear-gradient(
      135deg,
      ${colors.accentSecondary},
      ${colors.accent}
    );
    opacity: 0.35;
  }

  .ai-header {
    position: relative;
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 12px;
  }

  .ai-eyebrow {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 999px;
    background: ${colors.primary};
    color: ${colors.commonLighter};
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  h2 {
    margin: 4px 0 0;
    color: ${colors.primary};
    font-size: 1.15rem;
    font-weight: 600;
    line-height: 1.25;
  }

  p {
    position: relative;
    margin: 0 0 16px;
    color: ${colors.text};
  }
`;

export const ActionCard = styled.section`
  ${card}
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: ${colors.commonLighter};
  box-shadow: 0 -1px 7px rgb(0 0 0 / 16%);

  .action-header {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .action-icon {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: rgba(46, 60, 90, 0.08);
    color: ${colors.primary};
    font-size: 22px;
  }

  .action-title {
    display: block;
    color: ${colors.primary};
    font-size: 1rem;
  }

  .action-hint {
    color: ${colors.text};
    font-size: 0.85rem;
  }
`;

export const HelpModeSection = styled.div`
  padding: 14px 16px;
  border-radius: 10px;
  background: ${helpModeTint(0.1)};
  border: 1px solid ${helpModeTint(0.5)};
  border-left: 4px solid ${helpModeColors.strong};

  .help-mode-header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 10px;
  }

  .help-mode-icon {
    flex-shrink: 0;
    color: ${helpModeColors.strong};
    font-size: 26px;
  }

  label {
    flex: 1;
    color: ${colors.primary};
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
  }

  .ant-switch-checked {
    background: ${helpModeColors.strong};
  }

  p {
    margin: 0;
    color: ${colors.text};
    font-size: 0.85rem;
  }
`;
