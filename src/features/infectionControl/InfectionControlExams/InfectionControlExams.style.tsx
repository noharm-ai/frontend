import styled from "styled-components";

// a card like the cultures one beside it: the title, how many exams are out
// of range and "Ver todos" on top, one exam a row, and what the trend icons
// mean at the bottom. Given a height (beside the cultures card), the list
// scrolls between them
export const ExamsBox = styled.div`
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow:
    0 1px 2px 0 rgba(0, 0, 0, 0.03),
    0 1px 6px -1px rgba(0, 0, 0, 0.02),
    0 2px 4px 0 rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;

  .exams-header {
    align-items: center;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    gap: 12px;
    padding: 12px 16px;
  }

  .exams-title {
    color: #2e3c5a;
    font-size: 15px;
    font-weight: 600;
    margin: 0;
  }

  .exams-alerts {
    color: #8c8c8c;
    font-size: 12px;
  }

  .exams-all {
    margin-left: auto;
    padding: 0;
  }

  .exams-list {
    flex: 1;
    list-style: none;
    margin: 0;
    min-height: 0;
    overflow-y: auto;
    padding: 8px;
  }

  .exam-row {
    align-items: center;
    border-radius: 4px;
    color: #2e3c5a;
    display: grid;
    font-size: 13px;
    gap: 12px;
    grid-template-columns: minmax(0, 1fr) auto 14px;
    padding: 6px 8px 6px 18px;
    position: relative;
  }

  .exam-row + .exam-row {
    border-top: 1px solid #f0f0f0;
  }

  /* out of range: tinted, flagged by a dot and in red */
  .exam-row.alert {
    background: #fff1f0;
    border-top-color: transparent;
    color: #f5222d;
    font-weight: 600;

    .exam-name {
      color: #2e3c5a;
    }

    &::before {
      background: #f5222d;
      border-radius: 50%;
      content: "";
      height: 5px;
      left: 7px;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 5px;
    }
  }

  .exam-row.alert + .exam-row.alert {
    margin-top: 4px;
  }

  .exam-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .exam-value {
    text-align: right;
  }

  .exam-trend {
    color: #8c8c8c;
    font-size: 12px;
  }

  .exam-row.alert .exam-trend {
    color: inherit;
  }

  .exams-empty {
    flex: 1;
    margin: 24px 0;
  }

  .exams-legend {
    border-top: 1px solid #f0f0f0;
    color: #8c8c8c;
    font-size: 12px;
    padding: 8px 16px;
  }
`;
