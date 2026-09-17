import styled from "styled-components";

export const AlertContainer = styled.div`
  display: grid;
  /* ten alerts in three rows: a fourth row would make the card taller than
     the ones it sits beside */
  grid-template-columns: repeat(4, minmax(0, 1fr));
  column-gap: 6px;
  row-gap: 8px;
  margin-bottom: 2px;

  @media only screen and (min-width: 1515px) {
    column-gap: 10px;
  }

  > div {
    padding: 8px 4px;
    border: 1px solid #e0e0e0;
    border-radius: 5px;
    text-align: center;
    font-weight: 500;
    min-width: 0;
    font-size: 13px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    color: var(--nh-text-color);

    @media only screen and (min-width: 1515px) {
      font-size: 15px;
    }

    &.alert {
      border: 1px solid #f68c97;
      background: #f8dee2;
    }

    span:first-child {
      margin-right: 4px;
      font-size: 18px;
    }

    &:hover {
      box-shadow: 0px 1px 4px 0px rgb(0 0 0 / 16%);
    }
  }
`;
