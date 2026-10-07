import styled from "styled-components";

export const FollowUpBox = styled.div`
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  height: 100%;

  /* the status on top, its icon tinted by it */
  .follow-up-header {
    align-items: center;
    border-bottom: 1px solid #e0e0e0;
    display: flex;
    gap: 16px;
    padding: 18px 20px;

    --status-color: #595959;
    --status-background: #f5f5f5;

    &.pending {
      --status-color: #d46b08;
      --status-background: #fff7e6;
    }

    &.revised {
      --status-color: #389e0d;
      --status-background: #f6ffed;
    }
  }

  .follow-up-icon {
    align-items: center;
    background: var(--status-background);
    border-radius: 50%;
    color: var(--status-color);
    display: flex;
    flex: 0 0 auto;
    font-size: 18px;
    height: 44px;
    justify-content: center;
    width: 44px;
  }

  .follow-up-status {
    color: var(--status-color);
    font-size: 18px;
    font-weight: 600;
  }

  .follow-up-since {
    color: #8c8c8c;
  }

  .follow-up-rows {
    padding: 0 20px;
  }

  .follow-up-row {
    align-items: flex-start;
    display: flex;
    gap: 12px;
    padding: 14px 0;
  }

  .follow-up-row + .follow-up-row {
    border-top: 1px solid #f0f0f0;
  }

  .follow-up-row-icon {
    color: #8c8c8c;
    font-size: 16px;
    margin-top: 2px;
  }

  .follow-up-row-content {
    flex: 1;
    min-width: 0;
  }

  .follow-up-label {
    color: #8c8c8c;
    font-size: 13px;
  }

  .follow-up-value {
    color: #2e3c5a;
    font-size: 16px;
    font-weight: 600;
  }

  .follow-up-detail {
    color: #595959;
  }

  .follow-up-overdue {
    color: #cf1322;
  }

  .follow-up-action {
    align-self: center;
    padding: 0;
  }

  .follow-up-pendings {
    color: #2e3c5a;
    margin: 2px 0 0 0;
    padding-left: 18px;
  }
`;

export const HistoryBody = styled.div`
  .modal-title {
    margin-bottom: 16px;
  }

  > ul {
    max-height: 65vh;
    overflow-y: auto;
  }
`;
