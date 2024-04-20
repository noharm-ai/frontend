import styled from "styled-components/macro";

export const GraphContainer = styled.div`
  position: relative;
  height: calc(100vh - 250px);

  .action-container {
    position: absolute;
    top: 1rem;
    right: 1rem;
  }

  .ant-spin-container,
  .ant-spin-nested-loading {
    width: 100%;
    height: 100%;
  }
`;
