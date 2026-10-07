import styled from "styled-components";

export const ReviewBody = styled.div`
  .review-legend {
    color: #8c8c8c;
    margin: 0 0 16px 0;
  }

  /* the steps on the left, the drug (or the patient) being reviewed on the right */
  .review-layout {
    display: grid;
    gap: 24px;
    grid-template-columns: 230px minmax(0, 1fr);

    @media (max-width: 768px) {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  .review-steps {
    max-height: 70vh;
    overflow-y: auto;

    .step-title {
      display: block;
      max-width: 180px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .review-step {
    min-height: 360px;
    min-width: 0;
  }

  .review-section-title {
    color: #2e3c5a;
    font-weight: 600;
    margin: 0 0 8px 0;
  }

  .review-empty {
    color: #8c8c8c;
    margin-bottom: 16px;
  }

  .review-summary {
    margin-bottom: 16px;

    ul {
      margin: 0;
      padding-left: 18px;
    }

    li {
      margin-bottom: 4px;
    }
  }

  .review-summary-drug {
    background: none;
    border: 0;
    color: #2e3c5a;
    cursor: pointer;
    font: inherit;
    font-weight: 600;
    margin-right: 8px;
    padding: 0;

    &:hover {
      text-decoration: underline;
    }
  }
`;

export const DrugEvaluation = styled.div<{ $selected: boolean }>`
  .drug-header {
    align-items: flex-start;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .drug-name {
    color: #2e3c5a;
    font-size: 16px;
    font-weight: 600;
    margin: 0;
  }

  .drug-regimen {
    color: #595959;
    font-size: 13px;
  }

  .drug-timeline {
    margin-bottom: 12px;
  }

  .drug-current {
    background: #fafafa;
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    margin-bottom: 12px;
    padding: 8px 12px;

    em {
      color: #595959;
      display: block;
      margin-top: 2px;
    }
  }

  .drug-fields {
    background: ${(props) => (props.$selected ? "#f6fbfb" : "#fff")};
    border: 1px solid ${(props) => (props.$selected ? "#70bdc3" : "#e0e0e0")};
    border-radius: 8px;
    display: grid;
    gap: 8px 16px;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    margin-top: 10px;
    padding: 12px 14px;
  }

  .drug-field-triggers,
  .drug-field-notes {
    grid-column: 1 / -1;
  }

  /* one trigger per line */
  .drug-field-triggers .ant-checkbox-wrapper {
    display: flex;
    margin-inline-start: 0;
  }

  .drug-field-label {
    color: #8c8c8c;
    display: block;
    font-size: 12px;
    margin-bottom: 4px;
  }

  .drug-field-error {
    color: #cf1322;
    font-size: 12px;
    margin-top: 2px;
  }

  .ant-picker {
    width: 100%;
  }
`;
