import styled, { css } from "styled-components";

import { get } from "styles/utils";

const muted = "#898685";
const border = "#f0f0f0";
const danger = "#cf1322";

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

  .review-header {
    display: flex;
    flex-direction: column;
    gap: 4px;
    /* room for the close button */
    padding: 22px 64px 18px 28px;
  }

  .review-title {
    color: ${get("colors.primary")};
    font-size: 20px;
    font-weight: 600;
    margin: 0;
  }

  .review-legend {
    margin: 0;
  }

  /* the steps on the left, the drug (or the patient) being reviewed on the right */
  .review-layout {
    border-top: 1px solid ${border};
    display: grid;
    grid-template-columns: 280px minmax(0, 1fr);

    @media (max-width: 768px) {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  .review-step {
    display: flex;
    flex-direction: column;
    gap: 24px;
    min-height: 420px;
    min-width: 0;
    padding: 24px 28px 28px;
  }

  .review-footer {
    align-items: center;
    border-top: 1px solid ${border};
    display: flex;
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

  .drug-header {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .drug-header-title {
    align-items: flex-start;
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: space-between;

    .ant-tag {
      margin: 0;
    }
  }

  .drug-name {
    color: ${get("colors.primary")};
    flex: 1 1 360px;
    font-size: 18px;
    font-weight: 600;
    line-height: 1.35;
    margin: 0;
  }

  .drug-regimen {
    color: ${get("colors.primary")};
  }

  .drug-dose-weight {
    color: ${muted};
    font-size: 13px;
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

    /* an evaluation on record that no longer holds */
    &.invalidated {
      background: #fff7e6;
      border-color: #ffd591;
    }
  }

  .drug-current-label {
    color: ${muted};
    display: block;
    font-size: 12px;
    margin-bottom: 2px;
  }

  .drug-current-invalidated {
    border-top: 1px solid #ffd591;
    color: #d46b08;
    margin-top: 8px;
    padding-top: 6px;

    ul {
      margin: 2px 0 0;
      padding-left: 18px;
    }
  }

  .drug-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .drug-section-header {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: space-between;
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

  .drug-triggers {
    background: #fafafa;
    border: 1px solid ${border};
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px 14px;
  }

  .drug-triggers-summary {
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

  .drug-triggers-icon {
    color: ${get("colors.accentSecondary")};
  }

  /* one trigger per line */
  .drug-triggers-options {
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

  .summary-empty {
    color: ${muted};
  }

  .summary-list {
    border: 1px solid ${border};
    border-radius: 8px;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .summary-drug {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: space-between;
    padding: 12px 14px;

    & + .summary-drug {
      border-top: 1px solid ${border};
    }
  }

  .summary-drug-text {
    display: flex;
    flex: 1 1 260px;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .summary-drug-name {
    color: ${get("colors.primary")};
    font-weight: 500;
  }

  .summary-drug-detail {
    color: ${muted};
    font-size: 13px;
  }

  .summary-drug-actions {
    align-items: center;
    display: flex;
    gap: 12px;

    .ant-tag {
      margin: 0;
    }
  }
`;
