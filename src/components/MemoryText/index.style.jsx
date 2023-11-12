import styled from "styled-components/macro";

export const VariableContainer = styled.div`
  margin-top: 10px;

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
      .ant-tag {
        margin-bottom: 5px;
      }
    }
  }
`;
