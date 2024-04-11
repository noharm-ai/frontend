import styled from "styled-components/macro";

export const PageCard = styled.div`
  background: #fff;
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 2rem;
  margin-top: 2rem;
  box-shadow: 0 -1px 7px rgb(0 0 0 / 16%);
`;

export const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

export const PaginationContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

export const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: 10px;

  > * {
    margin-left: 5px;
  }

  .ant-dropdown-button {
    width: auto;
  }
`;
