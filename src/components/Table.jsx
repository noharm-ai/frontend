import { Table as AntTable } from "antd";
import styled from "styled-components";

import { get } from "styles/utils";

const Table = styled(AntTable)`
  .ant-table-title:not(:empty) {
    background: rgba(244, 244, 244, 0.6);
    font-size: 12px;
    padding: 5px 10px;

    @media (max-width: ${get("breakpoints.lg")}) {
      margin-top: 20px;
    }
  }

  .ant-table-thead > tr > th,
  .ant-table-tbody > tr > td {
    padding: 5px;
  }

  .ant-table-tbody > tr > td {
    color: rgba(0, 0, 0, 0.65);
  }

  .ant-table-thead > tr > th,
  .ant-table-thead > tr > td {
    background: transparent;
  }

  .ant-table-expand-icon-col {
    width: 35px;
  }

  .ant-table-column-title {
    color: ${get("colors.primary")};
    font-weight: ${get("weight.semiBold")};
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
        content: "";
        position: absolute;
        width: 100%;
        height: 1px;
        background: #fff;
        top: 50%;
      }
    }

    &.red {
      background-color: #f44336;
      color: #fff;
    }

    &.orange {
      background-color: #f57f17;
      color: #fff;
    }

    &.yellow {
      background-color: #ffc107;
      color: #fff;
    }

    &.green {
      background-color: #7ebe9a;
      color: #fff;
    }
  }

  .ant-table-tbody
    > tr.ant-table-row-hover:not(.ant-table-expanded-row):not(
      .ant-table-row-selected
    )
    > td,
  .ant-table-tbody
    > tr:hover:not(.ant-table-expanded-row):not(.ant-table-row-selected)
    > td {
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
      opacity: 1 !important;
    }
  }

  .ant-table-pagination.ant-pagination {
    margin: 5px;
  }

  .suspended {
    td:not(:nth-child(1)),
    a {
      opacity: 0.45;
      text-decoration: line-through;
    }

    .score-container {
      transition: opacity 0.3s linear;
      opacity: 0;
    }

    &:hover {
      .score-container {
        opacity: 1;
      }
    }
  }

  .checked {
    td:not(:nth-child(1)) {
      opacity: 0.75;
    }
  }

  .new-item {
    td:not(:nth-child(1)) {
      font-weight: 500;

      a {
        font-weight: 500;
      }
    }
  }

  .whitelist {
    .score-container {
      transition: opacity 0.3s linear;
      opacity: 0;
    }

    td:not(:nth-child(1)) {
      opacity: 0.45;

      a {
        opacity: 0.45;
      }
    }

    &:hover {
      .score-container {
        opacity: 1;
      }
    }
  }

  .danger {
    background: #f8dee2;

    td:not(:nth-child(1)) {
      opacity: 1;

      a {
        opacity: 1;
      }
    }
  }

  .highlight {
    background: #e6f7ff;
  }

  .selected {
    background: #e6f7ff;

    td:not(:nth-child(1)) {
      opacity: 1;

      a {
        opacity: 1;
      }
    }
  }

  .selectable {
    cursor: pointer;
    font-weight: 500;

    .anticon {
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.64, 0, 0.78, 0);

      svg {
        transition: all 0.3s cubic-bezier(0.64, 0, 0.78, 0);
      }
    }

    &:hover,
    &.active {
      color: #1890ff;

      .anticon {
        opacity: 1;
      }
    }
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

  .start-row {
    height: 4px;

    td {
      padding: 0 !important;
      border-bottom: 0;

      &:nth-child(1) {
        background: rgba(16, 142, 233, 0.5);
      }

      .flag {
        height: 3px;
      }

      span {
        margin-left: 0 !important;
      }
    }

    .ant-table-row-expand-icon {
      display: none;
    }

    &.solution-group {
      td {
        &:nth-child(1) {
          background: rgb(169 145 214);
        }
      }
    }
  }

  .group-row {
    td {
      &:nth-child(1) {
        border-left: 3px solid rgba(16, 142, 233, 0.5);
      }
    }

    &.solution-group {
      td {
        &:nth-child(1) {
          border-left: 3px solid rgb(169 145 214);
        }
      }
    }

    &.group-row-last {
      td {
        border-bottom: 0;
      }
    }
  }

  .end-row {
    height: 7px;

    td {
      padding: 0 !important;

      &:nth-child(1) {
        background: rgba(16, 142, 233, 0.5);
        border-bottom: 4px solid #fff;
      }

      .flag {
        height: 3px;
      }

      span {
        margin-left: 0 !important;
      }
    }

    .ant-table-row-expand-icon {
      display: none;
    }

    &:hover {
      td:first-child {
        background: rgba(16, 142, 233, 0.5) !important;
      }

      td:not(:first-child) {
        background: #fff !important;
      }
    }

    &.solution-group {
      td:nth-child(1) {
        background: rgb(169 145 214);
        border-bottom: 4px solid #fff;
      }
    }
  }

  .solution {
    &:hover {
      > td {
        background: rgb(169 145 214 / 20%) !important;
      }
    }
  }

  .summary-row {
    td:not(:first-child) {
      opacity: 0.45;
    }

    td {
      padding: 0 !important;
    }

    &:hover {
      td {
        opacity: 1;
        background: rgb(169 145 214 / 20%) !important;
      }
    }
  }

  .gtm-tag-alert {
    .ant-tag-red {
      margin-right: 0;
    }

    .ant-badge-dot {
      background: #f57f17;
    }
  }
`;

export const ExpandableTable = styled(Table)`
  &.condensed {
    .ant-table-thead > tr > th,
    .ant-table-tbody > tr > td {
      padding: 2px 5px;
    }
  }

  tr.ant-table-expanded-row {
    > td {
      padding: 0 !important;
    }
  }

  .ant-table-body {
    overflow-x: auto;
  }

  .ant-table-title {
    padding: 0;
  }

  .ant-table-expanded-row > td {
    border-bottom: 1px solid rgba(0, 0, 0, 0.3);
  }

  .ant-table-expand-icon-th,
  .ant-table-row-expand-icon-cell {
    width: 30px;
    min-width: 30px;
  }

  .limit-width {
    max-width: 700px;
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

export const TextColumn = styled.div`
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const CardTable = styled(AntTable)`
  .ant-table {
    border-radius: 8px;
    box-shadow: 0 -1px 7px rgb(0 0 0 / 16%);
    margin-inline: 0 !important;

    .ant-table-content {
      table {
        width: 100% !important;
      }
    }
  }

  &.ai-data {
    .ant-table {
      background: rgb(169 145 214 / 20%);
    }
  }

  .danger {
    background: #f8dee2;

    td:not(:nth-child(1)) {
      opacity: 1;

      a {
        opacity: 1;
      }
    }
  }
`;

export default Table;
