import styled from "styled-components";

/** Stacks the summary cards and stretches them to the height of the sibling chart. */
export const SummaryCards = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;

  > .ant-spin-nested-loading {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .ant-spin-container {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .stats-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
`;
