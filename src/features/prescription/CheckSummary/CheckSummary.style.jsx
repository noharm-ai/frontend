import styled from "styled-components";

export const CheckSummaryContainer = styled.div`
  position: relative;
  max-height: 60vh;
  overflow: auto;
  padding: 0 15px;
  background: #fafafa;
  border-radius: 8px;

  .group-header {
    position: sticky;
    top: 0;
    left: 0;
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 10px;
    padding: 6px 2px 0;
    z-index: 99;
    background: #fafafa;
    color: #2e3c5a;
    cursor: pointer;
  }

  .expand-button {
    width: auto;
    margin-right: 10px;

    .anticon {
      font-size: 18px;
    }
  }
`;
