import styled from "styled-components/macro";

export const DataList = styled.ul`
  padding: 0;
  margin: 0;

  li {
    display: flex;
    justify-content: space-between;
    padding: 0;
    border-bottom: 1px solid rgba(5, 5, 5, 0.06);
    padding: 10px 0;
  }

  li:last-child {
    border-bottom: 0;
  }
`;
