import styled from "styled-components";

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

  .folder-title {
    position: absolute;
    top: 1rem;
    left: 1.3rem;
    font-size: 18px;
    font-family: "Roboto", sans-serif;
    font-weight: 600;
  }

  .schema {
    position: absolute;
    top: 2.5rem;
    left: 1.3rem;
  }

  .template-date {
    position: absolute;
    top: 4rem;
    left: 1.3rem;
  }
`;

export const NifiQueueContainer = styled.div`
  position: absolute;
  right: 0;
  bottom: 5rem;
  height: 5rem;
  width: 300px;
`;
