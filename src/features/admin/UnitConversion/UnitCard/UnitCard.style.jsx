import styled from "styled-components/macro";
import { Card } from "antd";

export const ConversionUnitCard = styled(Card)`
  height: 100%;
  display: flex;
  flex-direction: column;

  .ant-card-body {
    flex: 1;

    .ant-spin-nested-loading,
    .ant-spin-container,
    form {
      height: 100%;
    }

    .conversion-unit-card-container {
      height: 100%;
      display: flex;
      flex-direction: column;

      > div:nth-child(1) {
        flex: 1;
      }

      .ant-input-number-group-wrapper {
        width: 100%;
      }
    }
  }

  &.success {
    border-color: #b7eb8f;
    .ant-card-head {
      background: #f6ffed;
    }
  }

  &.error {
    border-color: #ffccc7;

    .ant-card-head {
      background: #fff2f0;
    }
  }

  &.warning {
    border-color: #ffe58f;

    .ant-card-head {
      background: #fffbe6;
    }
  }

  .ant-card-head {
    transition: background 0.5s linear;
  }

  .ant-card-head-title {
    white-space: normal;

    button {
      color: rgba(0, 0, 0, 0.88);
      font-weight: 600;
      border: 0;
      background: transparent;
      padding: 0;
      cursor: pointer;
      text-align: left;

      &:hover {
        color: #1677ff;
      }
    }
  }

  .default-unit {
    .ant-input-number {
      border-color: #70bdc3;
    }

    .ant-input-number-group-addon {
      font-weight: 600;
      background: #70bdc3;
      color: #fff;
      border-color: #70bdc3;
    }
  }
`;
