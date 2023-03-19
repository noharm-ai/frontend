import styled from "styled-components/macro";

export const ConfigModalContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 40vh;
  overflow-y: auto;

  > div {
    display: flex;
    justify-content: space-between;
    padding: 5px 5px;
    border-bottom: 1px solid #ccc;
  }
`;
