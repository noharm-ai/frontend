import styled from "styled-components";

export const IndicatorCard = styled.div`
  background: #fff;
  border-radius: 10px;
  border: 2px solid #1e88e5;
  box-shadow: 0 -1px 7px rgb(30 136 229 / 16%);
  padding: 12px 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .indicator-title {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    color: #1e88e5;
    font-size: 15px;
    line-height: 1.3;
  }

  .indicator-help {
    color: #8c8c8c;
    cursor: help;
  }

  .indicator-value {
    text-align: right;
    font-size: 30px;
    font-weight: 500;
    color: #1565c0;
    margin-top: 8px;
  }

  .indicator-detail {
    text-align: right;
    font-size: 13px;
    color: #8c8c8c;
    min-height: 18px;
  }

  &.green {
    border-color: #74b077;
    box-shadow: 0 -1px 7px rgb(116 176 119 / 16%);

    .indicator-title {
      color: #74b077;
    }

    .indicator-value {
      color: #388e3c;
    }
  }

  &.orange {
    border-color: #f78562;
    box-shadow: 0 -1px 7px rgb(247 133 98 / 16%);

    .indicator-title {
      color: #f78562;
    }

    .indicator-value {
      color: #f4511e;
    }
  }

  &.red {
    border-color: #e6744e;
    box-shadow: 0 -1px 7px rgb(230 116 78 / 16%);

    .indicator-title,
    .indicator-value {
      color: #e6744e;
    }
  }

  @media print {
    .indicator-help {
      display: none;
    }
  }
`;
