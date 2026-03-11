import styled from "styled-components";

export const DoseCellPopover = styled.div`
  display: flex;
  flex-direction: column;

  .info-table {
    font-size: 12px;
    border-collapse: collapse;

    th,
    td {
      padding: 2px 8px;
      border: 1px solid #f0f0f0;
      vertical-align: top;
      text-align: left;

      &.center {
        text-align: center;
      }

      &.right {
        text-align: right;
      }

      &.header {
        background: #f5f5f5;
        font-weight: 600;
        color: #2e3c5a;
        white-space: nowrap;
      }
    }

    td {
      color: #595959;
      line-height: 1.3;

      .missing-data {
        color: red;
      }
    }
  }
`;
