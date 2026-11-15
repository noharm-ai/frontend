import styled from "styled-components";

export const AntibiogramBox = styled.div`
  .antibiogram-title {
    color: #8c8c8c;
    display: flex;
    flex-wrap: wrap;
    font-size: 12.5px;
    gap: 4px 8px;
    justify-content: space-between;
    margin: 0 0 6px;
  }

  .antibiogram-warning {
    color: #cf1322;
  }

  .ant-table-thead .organism-column {
    font-style: italic;
  }

  .antibiogram-drug {
    white-space: nowrap;

    .ant-tag {
      margin-left: 6px;
    }
  }

  .antibiogram-cell {
    white-space: nowrap;

    .ant-tag {
      margin: 0;
    }
  }

  .antibiogram-mic {
    color: #8c8c8c;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    margin-left: 6px;
  }

  /* a drug of the prescription the lab found resistant */
  .resistant-in-use > td {
    background: #fff5f4;
  }

  .muted {
    color: #d9d9d9;
  }
`;
