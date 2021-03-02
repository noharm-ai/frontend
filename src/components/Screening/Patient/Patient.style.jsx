import styled from 'styled-components/macro';

import { get } from '@styles/utils';
import Heading from '@components/Heading';

export const Wrapper = styled.div`
  border: 1px solid ${get('colors.detail')};
  overflow: hidden;
`;

export const Name = styled(Heading)`
  padding: 6px 15px;

  @media (max-width: 768px) {
    margin: 0;
  }
`;

export const NameWrapper = styled.div`
  transition: all 0.5s;
  background: ${props => (props.hasIntervention ? '#ffcdd2' : '#fff')};

  .btn-container {
    display: flex;
    justify-content: flex-end;

    > i {
      padding-top: 6px;
      margin-right: 7px;
    }
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

  &.recalc {
    display: flex;
    justify-content: center;
    text-align: center;
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

  &.experimental {
    .cell strong {
      color: #1890ff;
    }
  }
`;

export const ExamBox = styled.div`
  .ant-statistic-content {
    color: #696766;
    font-size: 15px;
    font-family: ${get('fonts.primary')};
  }

  .ant-statistic-content-value-decimal {
    font-size: 15px;
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
