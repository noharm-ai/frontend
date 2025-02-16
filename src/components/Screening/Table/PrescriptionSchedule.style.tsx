import styled from "styled-components";
import { Table, TableProps } from "antd";

export const ScrollableTable: typeof Table = styled(Table)<TableProps>`
  th.ant-table-cell.ant-table-cell-fix-left {
    background: #fff !important;
    font-weight: 700 !important;
    color: rgba(0, 0, 0, 0.65);
  }

  th.ant-table-cell {
    font-weight: 400 !important;
  }
`;
