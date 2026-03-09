import styled from "styled-components";

export const DrugCellPopover = styled.div`
  min-width: 220px;
  max-width: 350px;

  .popover-title {
    font-weight: 600;
    color: #2e3c5a;
    font-size: 12px;
    background: #f0f2f5;
    line-height: 1.2;
    margin: -12px -16px 10px;
    padding: 8px 16px;
    border-radius: 6px 6px 0 0;
  }

  .info-grid {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 3px 10px;
    font-size: 12px;
    margin-bottom: 10px;
  }

  .info-label {
    font-weight: 600;
    color: #2e3c5a;
    white-space: nowrap;
  }

  .info-value {
    color: #595959;
    line-height: 1.2;
  }

  .divider {
    border-top: 1px solid #f0f0f0;
    margin: 10px 0;
  }

  .substance-warning {
    font-size: 12px;
    color: #ff4d4f;
    border-left: 3px solid #ff4d4f;
    padding-left: 6px;
    line-height: 1.4;
    margin-bottom: 8px;
  }
`;
