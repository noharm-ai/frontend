import styled from "styled-components/macro";

export const PrioritizationPage = styled.div`
  position: relative;
  min-height: 30rem;

  .grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    grid-column-gap: 2rem;
    grid-row-gap: 3.5rem;
  }
`;
