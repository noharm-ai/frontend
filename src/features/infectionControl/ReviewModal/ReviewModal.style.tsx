import styled, { css } from "styled-components";

import { get } from "styles/utils";

import { ALERT_LEVEL_COLORS } from "../ScreeningAlerts/ScreeningAlerts.style";

const muted = "#898685";
const border = "#f0f0f0";
const danger = "#cf1322";
const chipBorder = "#e8e8e8";

// the level dots of the alerts chip, as the screening alerts
const levelDots = Object.entries(ALERT_LEVEL_COLORS)
  .map(
    ([level, { color }]) => `
      .drug-chip-level.${level} .drug-chip-dot {
        background: ${color};
      }
    `,
  )
  .join("");

// a button that reads as a link: "Alterar", "Editar"
const linkButton = css`
  .link-button {
    background: none;
    border: 0;
    color: ${get("colors.primary")};
    cursor: pointer;
    flex: none;
    font: inherit;
    font-size: 13px;
    padding: 0 2px;
    text-decoration: underline;

    &:hover {
      color: ${get("colors.accentSecondary")};
    }
  }
`;

export const ReviewBody = styled.div`
  color: ${get("colors.text")};
  display: flex;
  flex-direction: column;
  /* the same on every step: the rail and the step scroll inside */
  height: min(1000px, calc(100vh - 48px));

  .review-header {
    align-items: center;
    display: flex;
    flex: none;
    gap: 8px;
    /* room for the close button */
    padding: 18px 64px 16px 28px;
  }

  .review-title {
    color: ${get("colors.primary")};
    font-size: 20px;
    font-weight: 600;
    margin: 0;
  }

  /* the steps on the left, the drug (or the patient) being reviewed on the right */
  .review-layout {
    border-top: 1px solid ${border};
    display: grid;
    flex: 1;
    grid-template-columns: 280px minmax(0, 1fr);
    grid-template-rows: minmax(0, 1fr);
    min-height: 0;

    > * {
      overflow-y: auto;
    }

    /* stacked, they scroll together */
    @media (max-width: 768px) {
      grid-template-columns: minmax(0, 1fr);
      grid-template-rows: none;
      overflow-y: auto;

      > * {
        overflow-y: visible;
      }
    }
  }

  .review-step {
    display: flex;
    flex-direction: column;
    gap: 24px;
    min-width: 0;
    padding: 24px 28px 28px;
  }

  .review-footer {
    align-items: center;
    border-top: 1px solid ${border};
    display: flex;
    flex: none;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: space-between;
    padding: 14px 28px;
  }

  .review-footer-status {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    font-size: 13px;
    gap: 10px;
  }

  .review-footer-step {
    color: ${muted};
  }

  .review-footer-hint {
    color: ${muted};

    &.error {
      color: ${danger};
    }
  }

  .review-footer-actions {
    display: flex;
    gap: 8px;

    .ant-btn-primary:not(:disabled) {
      background: ${get("colors.accentSecondary")};
      border-color: ${get("colors.accentSecondary")};

      &:hover {
        background: ${get("colors.accent")};
        border-color: ${get("colors.accent")};
      }
    }

    .ant-btn-default:not(:disabled):hover {
      border-color: ${get("colors.accentSecondary")};
      color: ${get("colors.primary")};
    }
  }
`;

export const DrugEvaluation = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;

  ${linkButton}

  /* the drug on the left, its pendings and alerts on the right */
  .drug-header {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 12px 24px;
    justify-content: space-between;
  }

  .drug-header-main {
    display: flex;
    flex: 1 1 360px;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .drug-header-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .drug-chip {
    align-items: center;
    background: #fff;
    border: 1px solid ${chipBorder};
    border-radius: 8px;
    color: ${get("colors.primary")};
    cursor: pointer;
    display: inline-flex;
    font: inherit;
    font-size: 13px;
    font-weight: 500;
    gap: 8px;
    padding: 6px 12px;

    &:hover {
      border-color: ${get("colors.accentSecondary")};
    }

    > .anticon {
      color: ${muted};
      font-size: 10px;
    }

    &.pendings {
      background: #fff7e6;
      border-color: #ffd591;

      .drug-chip-dot {
        background: #fa8c16;
      }

      &:hover {
        border-color: #fa8c16;
      }
    }
  }

  .drug-chip-dot {
    border-radius: 50%;
    display: inline-block;
    flex-shrink: 0;
    height: 7px;
    width: 7px;
  }

  .drug-chip-level {
    align-items: center;
    display: inline-flex;
    font-weight: 400;
    gap: 4px;
  }

  ${levelDots}

  .drug-name {
    color: ${get("colors.primary")};
    font-size: 18px;
    font-weight: 600;
    line-height: 1.35;
    margin: 0;
  }

  .drug-regimen {
    align-items: baseline;
    color: ${get("colors.primary")};
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    line-height: 1.4;

    > span {
      opacity: 0.75;
    }

    .link-button {
      color: ${muted};
      font-size: 12px;

      &:hover {
        color: ${get("colors.accentSecondary")};
      }
    }
  }

  .drug-current {
    background: #fafafa;
    border: 1px solid ${border};
    border-radius: 8px;
    padding: 12px 14px;

    em {
      display: block;
      margin-top: 2px;
    }
  }

  .drug-current-label {
    color: ${muted};
    display: block;
    font-size: 12px;
    margin-bottom: 2px;
  }

  .drug-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .drug-section-title {
    color: ${get("colors.primary")};
    font-size: 14px;
    font-weight: 600;
    margin: 0;
  }

  .drug-period {
    background: #eaf6f7;
    border-radius: 4px;
    color: ${get("colors.primary")};
    font-size: 13px;
    font-weight: 500;
    padding: 2px 8px;

    &.empty {
      background: #fafafa;
      color: ${muted};
    }

    &.error {
      background: #fff1f0;
      color: ${danger};
    }
  }

  .drug-validity {
    align-items: center;
    display: grid;
    padding-left: 26px;
    gap: 12px 16px;
    grid-template-columns: 96px minmax(0, 1fr);

    @media (max-width: 576px) {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  .drug-validity-label {
    color: ${get("colors.primary")};
    font-size: 13px;
  }

  .drug-validity-choice {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .ant-picker {
      width: 160px;
    }
  }

  .drug-field-info {
    font-size: 12px;
  }

  .drug-notice {
    align-items: center;
    background: #fafafa;
    border: 1px solid ${border};
    border-radius: 8px;
    display: flex;
    font-size: 13px;
    gap: 10px;
    padding: 12px 14px;

    .anticon {
      color: ${muted};
    }
  }

  /* the period, the triggers and the notes of the verdict, kept together */
  .drug-options {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  /* a choice told in a line, opened to change it: the period, the triggers */
  .drug-option-box {
    background: #fafafa;
    border: 1px solid ${border};
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px 14px;
  }

  .drug-option-summary {
    align-items: center;
    color: ${get("colors.primary")};
    display: flex;
    font-size: 13px;
    gap: 10px;

    > span:nth-child(2) {
      flex: 1;
      min-width: 0;
    }
  }

  .drug-option-icon {
    color: ${get("colors.accentSecondary")};
  }

  /* one trigger per line */
  .drug-option-details {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-left: 26px;

    .ant-checkbox-wrapper {
      font-size: 13px;
      margin-inline-start: 0;
    }
  }

  .drug-notes {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .drug-notes-header {
    align-items: baseline;
    display: flex;
    gap: 6px;
  }

  .drug-notes-hint {
    color: ${muted};
    font-size: 12px;

    &.required {
      color: ${danger};
    }
  }
`;

export const ReviewSummary = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;

  ${linkButton}

  .step-header {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .step-title {
    color: ${get("colors.primary")};
    font-size: 18px;
    font-weight: 600;
    margin: 0;
  }

  .step-legend {
    margin: 0;
  }

  .summary-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .summary-section-title {
    color: ${get("colors.primary")};
    font-size: 14px;
    font-weight: 600;
    margin: 0;
  }

  .summary-choice {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .ant-picker {
      width: 160px;
    }
  }

  .summary-info {
    font-size: 12px;
  }

  .summary-error {
    color: ${danger};
    font-size: 12px;
  }

  .summary-notes-header {
    align-items: baseline;
    display: flex;
    gap: 6px;
  }

  .summary-hint {
    color: ${muted};
    font-size: 12px;
  }
`;

// the clinical note step: the summary layout with the note's editor
export const ClinicalNote = styled(ReviewSummary)`
  .note-text-header {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: space-between;
  }

  .note-actions {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .note-type {
    max-width: 360px;
    width: 100%;
  }

  .note-outdated {
    align-items: center;
    background: #fffbe6;
    border: 1px solid #ffe58f;
    border-radius: 8px;
    display: flex;
    flex-wrap: wrap;
    font-size: 13px;
    gap: 8px;
    padding: 8px 12px;
  }

  .note-notice {
    background: #fafafa;
    border: 1px solid ${border};
    border-radius: 8px;
    color: ${muted};
    padding: 12px 14px;
  }
`;

// the variables a note template takes, listed in a popover
export const NoteVariables = styled.dl`
  display: grid;
  gap: 4px 12px;
  grid-template-columns: auto 1fr;
  margin: 0;
  max-height: 50vh;
  max-width: 480px;
  overflow-y: auto;

  dt {
    font-family: monospace;
    font-size: 12px;
  }

  dd {
    color: ${muted};
    font-size: 12px;
    margin: 0;
  }
`;
