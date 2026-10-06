import styled from "styled-components";

export const ReviewBody = styled.div`
  .review-legend {
    color: #8c8c8c;
    margin: 0 0 16px 0;
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
`;

export const DrugEvaluation = styled.div<{ $selected: boolean }>`
  background: ${(props) => (props.$selected ? "#f6fbfb" : "#fff")};
  border: 1px solid ${(props) => (props.$selected ? "#70bdc3" : "#e0e0e0")};
  border-radius: 8px;
  margin-bottom: 12px;
  padding: 10px 14px;

  .drug-header {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: space-between;
  }

  .drug-name {
    color: #2e3c5a;
    font-weight: 600;
  }

  .drug-fields {
    display: grid;
    gap: 8px 16px;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    margin-top: 10px;
  }

  .drug-field-notes {
    grid-column: 1 / -1;
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
