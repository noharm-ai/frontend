import 'antd/lib/table/style/index.css';
import AntTable from 'antd/lib/table';
import styled from 'styled-components/macro';

import { get } from '@styles/utils';

const Table = styled(AntTable)`
  .ant-table-title:not(:empty) {
    background: rgba(244, 244, 244, 0.6);
    font-size: 12px;
    padding: 5px 10px;

    @media (max-width: ${get('breakpoints.lg')}) {
      margin-top: 20px;
    }
  }

  .ant-table-thead > tr > th,
  .ant-table-tbody > tr > td {
    padding: 5px;
  }

  .ant-table-thead > tr > th {
    background: transparent;
  }

  .ant-table-column-title {
    color: ${get('colors.primary')};
    font-family: ${get('fonts.primary')};
    font-weight: ${get('weight.semiBold')};
  }

  .ant-table-row td:not(:first-child):not(:nth-child(2)),
  .ant-table-thead th:not(:first-child):not(:nth-child(2)) {
    text-align: center;
  }

  .flag {
    border-radius: 3px;
    display: inline-block;
    height: 15px;
    width: 5px;

    &.has-score {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      height: 32px;
      width: 13px;
      border-radius: 7px;
      font-size: 11px;
      padding-top: 1px;

      &:before {
        content: '';
        position: absolute;
        width: 100%;
        height: 1px;
        background: #fff;
        top: 50%;
      }
    }

    &.red {
      background-color: #e46666;
      color: #fff;
    }

    &.orange {
      background-color: #e67e22;
      color: #fff;
    }

    &.yellow {
      background-color: #e4da66;
      color: #000;
    }

    &.green {
      background-color: #7ebe9a;
      color: #fff;
    }
  }

  .ant-table-thead
    > tr.ant-table-row-hover:not(.ant-table-expanded-row):not(.ant-table-row-selected)
    > td,
  .ant-table-tbody
    > tr.ant-table-row-hover:not(.ant-table-expanded-row):not(.ant-table-row-selected)
    > td,
  .ant-table-thead > tr:hover:not(.ant-table-expanded-row):not(.ant-table-row-selected) > td,
  .ant-table-tbody > tr:hover:not(.ant-table-expanded-row):not(.ant-table-row-selected) > td {
    background: rgba(244, 244, 244, 0.8);
  }

  .ant-table-row-expand-icon-cell,
  .ant-table-expand-icon-th {
    width: 15px;
  }

  .ant-table-right-border {
    border-right: 1px solid #e8e8e8;
  }

  .ant-table-row {
    transition: all 0.5s;
  }

  .ant-table-row:hover {
    td,
    a {
      opacity: 1;
    }
  }

  .suspended {
    td,
    a {
      opacity: 0.45;
      text-decoration: line-through;
    }
  }

  .checked {
    td {
      opacity: 0.45;
    }
  }

  .danger {
    background: #ffcdd2;
  }

  .highlight {
    background: #e6f7ff;
  }

  .hidden-sorter {
    .ant-table-column-sorters {
      display: none !important;
    }
  }

  .divider-row {
    .ant-table-row-expand-icon {
      display: none;
    }
  }
`;

export const ExpandableTable = styled(Table)`
  .ant-table-title {
    padding: 0;
  }

  .ant-table-expanded-row > td {
    border-bottom: 1px solid rgba(0, 0, 0, 0.3);
  }
`;

export const NestedTableContainer = styled.div`
  margin-top: 5px;
  margin-bottom: 35px;

  .ant-descriptions-item-label {
    font-weight: 600;
    color: #2e3c5a;
  }
`;

export default Table;
