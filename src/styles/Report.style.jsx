import styled from "styled-components/macro";

export const StatsCard = styled.div`
  position: relative;
  background: #fff;
  padding: 1rem;
  border-radius: 10px;

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

  &.loading {
    animation: flickerAnimation 2s infinite;
  }
`;

export const SectionHeader = styled.h2`
  color: #1565c0;
  font-size: 2.5rem;
  font-weight: 500;
  margin-bottom: 1rem;
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
