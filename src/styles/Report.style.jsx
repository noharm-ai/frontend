import styled from "styled-components/macro";

export const StatsCard = styled.div`
  position: relative;
  background: #fff;
  padding: 1rem;
  border-radius: 10px;
  border: 2px solid #696766;

  .stats-title {
    text-align: right;
    font-size: 2rem;
    font-weight: 300;
  }

  .stats-value {
    text-align: right;
    font-size: 4rem;
    font-weight: 500;
  }

  &.blue {
    box-shadow: 0 -1px 7px rgb(30 136 229 / 16%);
    border: 2px solid #1e88e5;

    .stats-title {
      color: #1e88e5;
    }

    .stats-value {
      color: #1565c0;
    }
  }

  &.green {
    box-shadow: 0 -1px 7px rgb(116 176 119 / 16%);
    border: 2px solid #74b077;

    .stats-title {
      color: #74b077;
    }

    .stats-value {
      color: #388e3c;
    }
  }

  &.orange {
    box-shadow: 0 -1px 7px rgb(116 176 119 / 16%);
    border: 2px solid #f78562;

    .stats-title {
      color: #f78562;
    }

    .stats-value {
      color: #f4511e;
    }
  }

  &.red {
    box-shadow: 0 -1px 7px rgb(116 176 119 / 16%);
    border: 2px solid #e6744e;

    .stats-title {
      color: #e6744e;
    }

    .stats-value {
      color: #e6744e;
    }
  }

  &.yellow {
    box-shadow: 0 -1px 7px rgb(116 176 119 / 16%);
    border: 2px solid #f2b530;

    .stats-title {
      color: #f2b530;
    }

    .stats-value {
      color: #f2b530;
    }
  }

  &.loading {
    animation: flickerAnimation 2s infinite;
  }

  @media print {
    .stats-title {
      font-size: 1.5rem;
    }

    .stats-value {
      font-size: 3rem;
    }
  }
`;

export const SectionHeader = styled.div`
  h2 {
    color: #1565c0;
    font-size: 2.5rem;
    font-weight: 500;
    margin-bottom: 0;

    @media print {
      margin-bottom: 10px;
    }
  }

  > div {
    font-size: 1rem;
    font-weight: 300;
    margin-bottom: 0;
    margin-top: 5px;

    @media print {
      margin-bottom: 10px;
    }
  }
`;

export const ChartCard = styled.div`
  background: #fff;
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 0 -1px 7px rgb(0 0 0 / 16%);
  min-height: 20rem;

  &.loading {
    animation: flickerAnimation 2s infinite;
  }
`;

export const ReportContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;

  .ant-space {
    width: 100%;
  }
`;

export const ReportHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 4px solid #1565c0;
  padding: 1rem 0;
  margin-bottom: 30px;
  display: none;

  h1 {
    color: #1565c0;
    font-size: 3rem;
    font-weight: 500;
    margin-bottom: 0;
    margin-top: 0;
  }

  .brand {
    display: block;
    min-width: 164px;
    max-width: 200px;
    width: 100%;

    svg {
      .cls-2 {
        fill: rgb(34, 57, 91);
      }
    }
  }
`;

export const ReportFilterContainer = styled.div`
  display: none;

  .report-filter-list {
    background: #e6f4ff;
    border: 1px solid #91caff;
    border-radius: 8px;
    padding: 8px 12px;
  }

  @media print {
    display: block;
  }
`;

export const ReportPrintDescriptions = styled.div`
  display: none;
  margin: 20px 0;

  > div {
    label {
      font-weight: 600;
    }
  }

  @media print {
    display: block;
  }
`;
