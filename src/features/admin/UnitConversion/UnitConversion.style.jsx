import styled from "styled-components";

export const KeyboardHintBar = styled.div`
  margin-top: 16px;
  padding: 10px 16px;
  background: #f8f9fc;
  border: 1px solid #e0e3ea;
  border-radius: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 20px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.55);

  .hint-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  kbd {
    display: inline-flex;
    align-items: center;
    padding: 1px 6px;
    background: #fff;
    border: 1px solid #ccc;
    border-radius: 4px;
    border-bottom-width: 2px;
    font-family: monospace;
    font-size: 11px;
    color: rgba(0, 0, 0, 0.75);
    line-height: 1.6;
  }
`;

export const ProgressContainer = styled.div`
  margin-bottom: 16px;
  min-width: 350px;

  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
    font-size: 13px;
    color: rgba(0, 0, 0, 0.65);
  }

  .progress-count {
    font-weight: 500;
  }
`;
