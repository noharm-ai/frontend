import styled from "styled-components";

// the right side of the summary card: a dot and the status on top, colored
// by it, then the last review, the next one and the pending reasons
export const FollowUpBox = styled.div`
  --status-color: #595959;

  border-left: 1px solid #f0f0f0;
  flex: 0 0 42%;
  min-width: 0;
  padding: 14px 20px 16px;

  &.pending {
    --status-color: #f4511e;
  }

  &.revised {
    --status-color: #389e0d;
  }

  @media (max-width: 992px) {
    border-left: 0;
    border-top: 1px solid #f0f0f0;
  }

  /* as tall as the patient header beside it (InfectionControlPatient), so
     both rows below line up */
  .follow-up-header {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0 8px;
    min-height: 32px;
    margin-bottom: 6px;
  }

  .follow-up-dot {
    background: var(--status-color);
    border-radius: 50%;
    flex: 0 0 auto;
    height: 8px;
    width: 8px;
  }

  .follow-up-status {
    color: var(--status-color);
    font-size: 14px;
    font-weight: 600;
  }

  .follow-up-since {
    color: #8c8c8c;
    font-size: 12px;
  }

  .follow-up-columns {
    display: grid;
    gap: 12px 16px;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .follow-up-column {
    min-width: 0;
  }

  .follow-up-label {
    color: #8c8c8c;
    font-size: 12px;
  }

  .follow-up-value {
    color: #2e3c5a;
    font-size: 14px;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .follow-up-link {
    font-size: 14px;
    font-weight: 600;
    height: auto;
    padding: 0;
  }

  .follow-up-detail {
    color: #8c8c8c;
    font-size: 12px;
    font-weight: 400;
    margin-left: 4px;
  }

  .follow-up-overdue,
  .follow-up-overdue .follow-up-detail {
    color: #cf1322;
  }

  .follow-up-hint {
    color: #595959;
    font-size: 13px;
  }
`;

export const HistoryBody = styled.div`
  .history-header {
    align-items: center;
    display: flex;
    gap: 12px;
    justify-content: space-between;
    margin-bottom: 16px;
    padding-right: 32px;
  }

  .modal-title {
    margin-bottom: 0;
  }

  > ul {
    max-height: 65vh;
    overflow-y: auto;
  }
`;

export const PendingsBody = styled.div`
  .modal-title {
    margin-bottom: 16px;
  }

  > ul {
    list-style: none;
    margin: 0;
    max-height: 65vh;
    overflow-y: auto;
    padding: 0;
  }

  li {
    align-items: flex-start;
    color: #2e3c5a;
    display: flex;
    font-size: 14px;
    gap: 10px;
    padding: 10px 0;
  }

  li + li {
    border-top: 1px solid #f0f0f0;
  }

  .pending-icon {
    color: #d46b08;
    margin-top: 3px;
  }

  .pending-date {
    color: #8c8c8c;
    font-size: 12px;
  }
`;
