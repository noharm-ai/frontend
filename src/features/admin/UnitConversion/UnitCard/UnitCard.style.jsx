import styled from "styled-components";
import { Card } from "antd";

export const ConversionUnitCard = styled(Card)`
  height: 100%;
  display: flex;
  flex-direction: column;
  transition:
    box-shadow 0.15s ease,
    border-color 0.15s ease;

  ${({ $isFocused }) =>
    $isFocused &&
    `
    outline: none;
    box-shadow: 0 0 0 3px rgba(46, 60, 90, 0.35), 0 2px 8px rgba(0,0,0,0.15);
    border-color: #2e3c5a !important;
  `}

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
    .ant-input {
      border-color: #70bdc3 !important;
    }

    .ant-space-addon {
      font-weight: 600;
      background: #70bdc3 !important;
      color: #fff !important;
      border-color: #70bdc3 !important;
    }
  }

  .default-unit-container {
    font-size: 12px;
    font-weight: 500;
    opacity: 0.6;
    background-color: #fafafa;
    padding: 8px;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 8px;
    border-radius: 8px;
    line-height: 1.2;

    a {
      color: #1677ff;
      font-weight: 600;

      &:hover {
        text-decoration: underline;
      }
    }
  }
`;
