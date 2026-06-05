import styled from "styled-components";

import { get } from "styles/utils";

export const NotificationCard = styled.div`
  border: 1px solid #e8e8e8;
  border-left: 4px solid #a991d6;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 12px;

  .notification-header {
    padding: 6px 16px;
    border-bottom: 1px solid #f0f0f0;
  }

  .notification-body {
    padding: 16px;
  }

  .notification-date {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.4);
  }

  .notification-title {
    font-size: 15px;
    font-weight: 600;
    color: ${get("colors.primary")};
  }

  .notification-content {
    font-size: 13px;
    color: rgba(0, 0, 0, 0.65);
    line-height: 1.6;
  }

  .notification-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 14px;
    padding-top: 10px;
    border-top: 1px solid #f0f0f0;
  }
`;

export const NotificationTrigger = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 10px 10px 10px 14px;
  color: ${get("colors.primary")};
  transition: background 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.04);
  }
`;
