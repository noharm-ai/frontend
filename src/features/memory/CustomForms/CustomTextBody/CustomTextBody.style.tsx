import styled from "styled-components";

export const CustomTextContainer = styled.div`
  padding: 2rem;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 0.5rem;

  .custom-text-intro {
    color: #555;
    margin-bottom: 1rem;
    line-height: 1.5;

    code {
      background: #f5f5f5;
      border-radius: 4px;
      padding: 0 4px;
    }
  }

  .custom-text-empty {
    padding: 1.5rem;
    text-align: center;
    color: #999;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    margin-bottom: 0.75rem;
  }
`;

export const BlockCard = styled.div`
  padding: 0.75rem;
  background: #f0f0f0;
  border-radius: 6px;
  margin-bottom: 0.75rem;

  &.has-error {
    outline: 1px solid #ff4d4f;
  }

  .block-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 0.75rem;

    .block-title {
      font-weight: 600;
      white-space: nowrap;
    }

    .block-name {
      flex: 1;
      min-width: 0;
    }
  }

  .block-section-label {
    font-weight: 500;
    margin-bottom: 0.25rem;
  }

  .block-conditions {
    background: #fff;
    border-radius: 6px;
    padding: 0.75rem;
    margin-bottom: 0.75rem;
  }

  .block-logic {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    margin-bottom: 0.5rem;
  }

  .block-always {
    color: #666;
    margin-bottom: 0.5rem;
  }

  .block-variables {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 0.5rem;
  }

  .form-error {
    color: #ff4d4f;
    font-size: 12px;
    margin-top: 4px;
  }
`;

export const ConditionLine = styled.div`
  margin-bottom: 0.5rem;

  .condition-fields {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
  }

  .condition-question {
    flex: 2 1 220px;
    min-width: 0;
  }

  .condition-operator {
    flex: 1 1 170px;
    min-width: 0;
  }

  .condition-value {
    flex: 1 1 170px;
    min-width: 0;
  }
`;

export const PreviewText = styled.div`
  min-height: 200px;
  max-height: 60vh;
  overflow: auto;
  padding: 0.75rem;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: #fff;

  p {
    margin: 0;
  }

  ul,
  ol {
    padding: 0 1rem;
  }

  .note-variable {
    background: #e6f4ff;
    color: #0958d9;
    border-radius: 4px;
    padding: 0 3px;
    font-family: monospace;
    font-size: 12px;
  }
`;
