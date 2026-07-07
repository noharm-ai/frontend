import styled from "styled-components";

import { TRAINING_COLOR } from "../TrainingController/TrainingController.style";

export const Panel = styled.div`
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 1092;
  width: 360px;
  max-width: calc(100vw - 48px);
  background: #fff;
  border: 1px solid ${TRAINING_COLOR};
  border-radius: 8px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.18);
  overflow: hidden;

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 10px 16px;
    background: ${TRAINING_COLOR};
    color: #fff;
    font-weight: 500;

    .step-counter {
      font-size: 12px;
      opacity: 0.85;
      white-space: nowrap;
    }
  }

  .panel-body {
    padding: 12px 16px 4px;

    h4 {
      margin: 0 0 6px;
      font-size: 15px;
    }

    p {
      margin: 0 0 8px;
    }

    .hint {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.55);
    }

    .step-done {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 8px;
      color: #389e0d;
      font-weight: 500;
    }

    &.completed {
      text-align: center;
      padding-top: 20px;

      .anticon {
        font-size: 36px;
        color: #389e0d;
        margin-bottom: 8px;
      }

      h4 {
        font-size: 16px;
      }
    }
  }

  .panel-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    padding: 8px 16px 12px;
  }
`;
