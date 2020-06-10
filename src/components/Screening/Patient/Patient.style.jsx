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

  p {
    margin: 0;
  }

  strong {
    color: #2e3c5a;
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
    padding: 20px;
  }
`;
