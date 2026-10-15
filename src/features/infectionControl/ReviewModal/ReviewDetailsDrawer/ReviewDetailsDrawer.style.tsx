import styled from "styled-components";

import { get } from "styles/utils";

import { ALERT_LEVEL_COLORS } from "../../ScreeningAlerts/ScreeningAlerts.style";

const muted = "#898685";
const border = "#e8e8e8";

// the text of the level tags, darker than the dots for contrast
const levelText = {
  high: "#cf1322",
  medium: "#d4380d",
  low: "#ad6800",
};

const levelTags = Object.entries(ALERT_LEVEL_COLORS)
  .map(
    ([level, { background }]) => `
      .details-level.${level} {
        background: ${background};
        color: ${levelText[level as keyof typeof levelText]};
      }
    `,
  )
  .join("");

export const DetailsTitle = styled.div`
  .details-title {
    color: ${get("colors.primary")};
    font-size: 18px;
    font-weight: 600;
    line-height: 1.3;
  }

  .details-subtitle {
    color: ${muted};
    font-size: 13px;
    font-weight: 400;
    margin-top: 2px;
  }
`;

export const DetailsBody = styled.div`
  color: ${get("colors.text")};

  .ant-tabs-nav {
    margin: 0;
    padding: 0 24px;
  }

  /* the app colors over the antd blue */
  .ant-tabs .ant-tabs-tab .ant-tabs-tab-btn {
    color: ${muted};
  }

  .ant-tabs .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
    color: ${get("colors.primary")};
    font-weight: 600;
  }

  .ant-tabs .ant-tabs-ink-bar {
    background: ${get("colors.accentSecondary")};
  }

  .details-tab {
    align-items: center;
    display: inline-flex;
    gap: 6px;
  }

  .details-count {
    background: #f0f0f0;
    border-radius: 10px;
    color: ${muted};
    font-size: 12px;
    line-height: 18px;
    min-width: 20px;
    padding: 0 6px;
    text-align: center;

    &.pendings {
      background: #fff7e6;
      color: #d46b08;
    }
  }

  .details-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px 24px 24px;
  }

  .details-card {
    border: 1px solid ${border};
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 12px 14px;

    p {
      margin: 0 !important;
    }
  }

  .details-card-meta {
    align-items: center;
    display: flex;
    gap: 8px;
  }

  .details-card-label {
    color: ${muted};
    font-size: 12px;
  }

  .details-level {
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    padding: 0 8px;
  }

  .details-notes {
    display: block;
  }

  .details-section-title {
    color: ${get("colors.primary")};
    font-weight: 600;
    margin-top: 4px;
  }

  /* each reason, from InvalidationReason, in a card */
  .details-reasons {
    display: flex;
    flex-direction: column;
    gap: 12px;
    list-style: none;
    margin: 0;
    padding: 0;

    > li {
      border: 1px solid ${border};
      border-radius: 8px;
      padding: 12px 14px;
    }
  }

  .details-handling {
    align-self: flex-start;
    background: none;
    border: 0;
    color: ${get("colors.primary")};
    cursor: pointer;
    font: inherit;
    font-size: 13px;
    padding: 0;
    text-decoration: underline;

    &:disabled {
      cursor: wait;
      opacity: 0.5;
    }
  }

  ${levelTags}
`;
