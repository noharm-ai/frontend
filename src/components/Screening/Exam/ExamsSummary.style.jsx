import styled from 'styled-components/macro';

import { get } from '@styles/utils';

export const ExamBox = styled.div`
  .ant-statistic-content {
    color: #696766;
    font-size: 15px;
    font-family: ${get('fonts.primary')};
  }

  .ant-statistic-content-value-decimal {
    font-size: 15px;
  }

  .ant-statistic-content-suffix {
    font-size: 14px;
  }

  .ant-statistic-title {
    margin-bottom: 0;
    color: #2e3c5a;
    font-weight: bolder;
    font-size: 16px;
  }

  .ant-card-head-title {
    color: #2e3c5a;
    font-size: 18px;
    font-weight: 600;
    padding: 8px 0;
  }

  .ant-card-head {
    min-height: 30px;
  }

  .ant-card {
    line-height: unset;
  }

  .ant-card-grid {
    width: 20%;
    padding: 38px 20px;
    text-align: center;
  }

  .ant-card-body {
    padding: 21px;
  }

  @media only screen and (max-width: 1515px) {
    .ant-card-grid {
      width: 20%;
      padding: 39px 4px;
      width: 25%;
    }

    .ant-statistic-content {
      font-size: 14px;
    }

    .ant-card-grid:nth-child(9),
    .ant-card-grid:nth-child(10) {
      display: none;
    }
  }
`;
