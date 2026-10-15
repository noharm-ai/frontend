import styled from "styled-components";

const border = "#e8e8e8";
const muted = "#595959";

// the level colors of the screening (DrugAlertLevelTag)
const levels = {
  high: { color: "#f44336", background: "#fdecea" },
  medium: { color: "#f4795b", background: "#fdeee9" },
  low: { color: "#ffb300", background: "#fff8e1" },
};

const levelColors = Object.entries(levels)
  .map(
    ([level, { color, background }]) => `
      .alerts-pill.${level} {
        background: ${background};
      }

      .${level} .alerts-dot {
        background: ${color};
      }
    `,
  )
  .join("");

export const AlertsCard = styled.div`
  border: 1px solid ${border};
  border-radius: 8px;
  color: #2e3c5a;

  .alerts-header {
    align-items: center;
    background: none;
    border: 0;
    color: inherit;
    cursor: pointer;
    display: flex;
    flex-wrap: wrap;
    font: inherit;
    gap: 8px 12px;
    padding: 10px 14px;
    text-align: left;
    width: 100%;
  }

  .alerts-title {
    font-weight: 600;
  }

  .alerts-summary {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .alerts-pill {
    align-items: center;
    border-radius: 12px;
    display: inline-flex;
    font-size: 13px;
    gap: 5px;
    padding: 1px 10px;
  }

  .alerts-dot {
    border-radius: 50%;
    display: inline-block;
    flex-shrink: 0;
    height: 7px;
    width: 7px;
  }

  .alerts-toggle {
    align-items: center;
    display: inline-flex;
    font-size: 13px;
    gap: 6px;
    margin-left: auto;

    .anticon {
      font-size: 10px;
    }
  }

  .alerts-group {
    border-top: 1px solid ${border};
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 10px 14px 12px;
  }

  .alerts-group-title {
    align-items: center;
    color: ${muted};
    display: flex;
    font-size: 12px;
    font-weight: 600;
    gap: 8px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .alerts-item {
    align-items: flex-start;
    display: flex;
    gap: 16px;
    padding-left: 15px;
  }

  .alerts-text {
    flex: 1;
    min-width: 0;

    p {
      margin: 0 !important;
    }
  }

  .alerts-handling {
    background: none;
    border: 0;
    color: inherit;
    cursor: pointer;
    flex-shrink: 0;
    font: inherit;
    padding: 0;
    text-decoration: underline;
    white-space: nowrap;

    &:disabled {
      cursor: wait;
      opacity: 0.5;
    }
  }

  ${levelColors}
`;
