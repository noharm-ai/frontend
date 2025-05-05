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

  // .folder-title {
  //   position: absolute;
  //   top: 1rem;
  //   left: 1.3rem;
  //   font-size: 18px;
  //   font-family: "Roboto", sans-serif;
  //   font-weight: 600;
  // }

  // .schema {
  //   position: absolute;
  //   top: 2.5rem;
  //   left: 1.3rem;
  // }

  // .template-date {
  //   position: absolute;
  //   top: 4rem;
  //   left: 1.3rem;
  // }
`;

export const NifiQueueContainer = styled.div`
  position: absolute;
  right: 0;
  bottom: 5rem;
  height: 5rem;
  width: 300px;
`;

export const GraphHeaderContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2.5rem;
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;
  border-bottom: 1px solid #e8e8e8;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03),
    0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02);

  .header-info {
    display: flex;
    align-items: center;
    gap: 0.4rem;

    .header-title {
      font-size: 18px;
      font-family: "Roboto", sans-serif;
      font-weight: 600;
    }
  }

  .folder-stats {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;
