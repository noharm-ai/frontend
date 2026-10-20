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

  .history-loading {
    display: flex;
    justify-content: center;
    padding: 48px 0;
  }

  .history-collections .legend {
    margin: 0;
  }

  /* the collection whose antibiogram is open */
  .culture-current > td {
    background: #f0f5ff;
  }
`;

// the footer: the previous culture of the card on the left, the next on the
// right
export const HistoryNav = styled.nav`
  align-items: center;
  display: flex;
  gap: 8px;
  justify-content: space-between;

  .history-position {
    color: #8c8c8c;
    white-space: nowrap;
  }
`;
