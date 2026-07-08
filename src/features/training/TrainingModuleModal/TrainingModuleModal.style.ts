import styled from "styled-components";

import colors from "styles/colors";
import { TRAINING_COLOR } from "../TrainingController/TrainingController.style";

export const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;

  h2 {
    margin: 0 0 4px;
    font-size: 22px;
    font-weight: 700;
    color: ${colors.primary};
  }

  p {
    margin: 0;
    color: ${colors.text};
  }
`;

export const ProgressSummary = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;

  .count {
    font-size: 13px;
    line-height: 1.3;
    color: ${colors.text};
    white-space: nowrap;
  }
`;

export const ModuleList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const ModuleItem = styled.div<{ $status: "completed" | "active" | "locked" }>`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 20px;
  border-radius: 8px;
  border: 1px solid
    ${({ $status }) => ($status === "active" ? TRAINING_COLOR : "transparent")};
  background: ${({ $status }) => ($status === "locked" ? "#f7f7f7" : "#fff")};
  box-shadow: ${({ $status }) =>
    $status === "active" ? `0 0 0 3px rgba(123, 31, 162, 0.08)` : "none"};

  .badge {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    font-size: 16px;

    ${({ $status }) =>
      $status === "completed" &&
      `
        background: #e8f5e9;
        color: #389e0d;
      `}

    ${({ $status }) =>
      $status === "active" &&
      `
        background: ${TRAINING_COLOR};
        color: #fff;
      `}

    ${({ $status }) =>
      $status === "locked" &&
      `
        background: #ececec;
        color: rgba(0, 0, 0, 0.35);
      `}
  }

  .content {
    flex: 1;
    min-width: 0;
  }

  .title {
    margin: 0 0 2px;
    font-size: 15px;
    font-weight: 600;
    color: ${({ $status }) =>
      $status === "locked" ? "rgba(0, 0, 0, 0.35)" : colors.primary};
  }

  .description {
    margin: 0;
    font-size: 13px;
    color: ${({ $status }) =>
      $status === "locked" ? "rgba(0, 0, 0, 0.35)" : colors.text};
  }

  .status-label {
    flex-shrink: 0;
    font-size: 13px;
    font-weight: 600;

    &.completed {
      color: #389e0d;
    }

    &.locked {
      color: rgba(0, 0, 0, 0.35);
    }
  }
`;

export const CertificateHint = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
  padding: 14px 20px;
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  font-size: 13px;
  color: ${colors.text};

  .anticon {
    font-size: 16px;
    color: ${colors.text};
  }
`;
