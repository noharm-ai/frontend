import styled from "styled-components";

export const PrintContainer = styled.div`
  font-family: "Roboto", sans-serif;
  padding: 10px;
`;

export const PrintHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 4px solid #1565c0;
  padding: 1rem 0;
  margin-bottom: 30px;

  h1 {
    color: #1565c0;
    font-size: 2rem;
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
