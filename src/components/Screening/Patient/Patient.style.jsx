import styled from 'styled-components/macro';

import { get } from '@styles/utils';
import Heading from '@components/Heading';

export const Wrapper = styled.div`
  border: 1px solid ${get('colors.detail')};
  border-radius: 6px;
  overflow: hidden;
`;

export const Name = styled(Heading)`
  padding: 6px 15px;

  @media (max-width: 768px) {
    margin: 0;
  }
`;

export const NameWrapper = styled.div`
  .btn-container {
    display: flex;
    justify-content: flex-end;
  }
`;

export const Box = styled.div`
  align-items: center;
  border-top: 1px solid ${get('colors.detail')};
  display: flex;
  min-height: 30px;
  padding: 3.5px 15px;

  strong {
    color: #2e3c5a;
  }

  &.see-more {
    display: flex;
    justify-content: center;
    text-align: center;

    button {
      color: #696766;
      height: auto;
    }

    button:hover span {
      text-decoration: underline;
    }

    div.tags {
      display: inline-block;
      vertical-align: middle;
    }
  }
`;

export const ExamBox = styled.div`
  .ant-statistic-content {
    color: #696766;
    font-size: 14px;
    font-family: ${get('fonts.primary')};
  }

  .ant-statistic-content-value-decimal {
    font-size: 14px;
  }

  .ant-statistic-title {
    margin-bottom: 0;
    color: #2e3c5a;
    font-weight: bolder;
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
    padding: 20px;
    text-align: center;
  }

  .ant-card-body {
    padding: 21px;
  }

  @media only screen and (max-width: 1440px) {
    .ant-card-grid {
      width: 20%;
      padding: 20px 4px;
      width: 25%;
    }

    .ant-card-grid:nth-child(9),
    .ant-card-grid:nth-child(10) {
      display: none;
    }
  }
`;
