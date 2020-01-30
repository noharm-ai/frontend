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

    &.red {
      background-color: #e46666;
    }

    &.yellow {
      background-color: #e4da66;
    }

    &.green {
      background-color: #7ebe9a;
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
`;

export default Table;
