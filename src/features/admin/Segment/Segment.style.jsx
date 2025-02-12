import styled from "styled-components";

export const FilterContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;

  > div {
    display: flex;
    align-items: center;
    margin-right: 10px;
  }

  .info {
    flex: 1;
    text-align: left;
  }

  .switch-container {
    display: flex;
    align-items: center;

    label {
      margin-left: 5px;
    }
  }
`;
