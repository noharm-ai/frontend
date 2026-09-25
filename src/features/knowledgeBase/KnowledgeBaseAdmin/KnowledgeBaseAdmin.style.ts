import styled from "styled-components";

export const FilterBar = styled.div`
  display: grid;
  grid-template-columns: 2fr 2fr 2fr 1fr auto;
  gap: 8px;
  margin-bottom: 16px;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;
