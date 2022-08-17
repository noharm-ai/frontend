import styled from "styled-components/macro";

export const AlertContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  column-gap: 8px;
  row-gap: 8px;
  justify-items: center;
  margin-bottom: 2px;

  @media only screen and (min-width: 1515px) {
    column-gap: 15px;
  }

  > div {
    padding: 5px 0;
    border: 1px solid #e0e0e0;
    border-radius: 5px;
    text-align: center;
    font-weight: 500;
    min-width: 65px;
    font-size: 14px;

    @media only screen and (min-width: 1515px) {
      font-size: 16px;
    }

    &.alert {
      border: 1px solid #f68c97;
      background: #f8dee2;
    }

    span {
      margin-right: 8px;
      font-size: 16px;

      @media only screen and (min-width: 1515px) {
        font-size: 18px;
      }
    }

    &:hover {
      box-shadow: 0px 1px 4px 0px rgb(0 0 0 / 16%);
    }
  }
`;
