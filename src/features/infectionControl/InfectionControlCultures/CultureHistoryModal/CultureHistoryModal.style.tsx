import styled from "styled-components";

export const HistoryBody = styled.div`
  .history-header {
    margin-bottom: 12px;
    padding-right: 32px;
  }

  .history-title {
    color: #2e3c5a;
    font-size: 18px;
    font-weight: 600;
    margin: 0;
  }

  .history-material {
    color: #595959;
  }

  .history-legend {
    color: #8c8c8c;
    margin: 4px 0 0 0;
  }

  /* the culture whose row was clicked on the recent cultures */
  .culture-current > td {
    background: #f0f5ff;
  }
`;
