import styled from "styled-components";

export const CultureResultContainer = styled.div`
  > div {
    display: flex;
    padding: 5px 0;
    border-bottom: 1px solid #ccc;

    &:last-child {
      border-bottom: 0;
    }

    label {
      display: block;
      font-weight: 600;
      text-align: right;
    }

    span {
      display: block;
      flex: 1;
      margin-left: 0.5rem;
    }
  }
`;
