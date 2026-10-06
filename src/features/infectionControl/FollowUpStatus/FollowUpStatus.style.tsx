import styled from "styled-components";

export const FollowUpBox = styled.div`
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 24px;
  padding: 14px 20px;

  .follow-up-header {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 8px 12px;
    justify-content: space-between;
  }

  .follow-up-title {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .follow-up-title h2 {
    color: #2e3c5a;
    font-size: 18px;
    font-weight: 600;
    margin: 0;
  }

  .follow-up-since {
    color: #8c8c8c;
    font-size: 12px;
  }

  .follow-up-hint {
    color: #8c8c8c;
    margin: 8px 0 0 0;
  }

  .follow-up-data {
    display: grid;
    gap: 10px 24px;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    margin-top: 12px;
  }

  .follow-up-data-item {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .follow-up-data-label {
    color: #8c8c8c;
    font-size: 12px;
  }

  .follow-up-data-value {
    color: #2e3c5a;
    font-weight: 500;
  }

  .follow-up-overdue {
    color: #cf1322;
  }

  .follow-up-pendings {
    margin-top: 12px;
  }

  .follow-up-pendings ul {
    margin: 4px 0 0 0;
    padding-left: 20px;
  }

  .follow-up-pendings li {
    color: #2e3c5a;
  }

  .follow-up-pendings .muted {
    color: #8c8c8c;
  }
`;
