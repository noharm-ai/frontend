import styled from "styled-components/macro";

export const VariableContainer = styled.div`
  margin-top: 30px;

  .variables-title {
    font-weight: 600;
  }

  .variables-legend {
    font-weight: 300;
    font-size: 12px;
  }

  .variables-group {
    margin-top: 10px;

    .variables-group-list {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
  }
`;
