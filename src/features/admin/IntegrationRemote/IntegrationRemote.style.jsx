import styled from "styled-components/macro";

export const GraphContainer = styled.div`
  position: relative;
  height: 100%;
  padding: 1rem;

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
