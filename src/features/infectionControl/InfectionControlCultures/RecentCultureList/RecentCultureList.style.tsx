import styled from "styled-components";

export const CultureList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;

  > li + li {
    border-top: 1px solid #f0f0f0;
  }

  /* a block opens its culture */
  .recent-culture {
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 10px 16px;

    &:hover,
    &:focus-visible {
      background: #f0f5ff;
      outline: none;
    }
  }

  .recent-culture-head {
    align-items: flex-start;
    display: flex;
    gap: 16px;
    justify-content: space-between;
  }

  .recent-culture-dates {
    column-gap: 8px;
    display: grid;
    flex-shrink: 0;
    font-size: 12px;
    grid-template-columns: auto auto;
    margin: 0;

    dt {
      color: #8c8c8c;
    }

    dd {
      color: #2e3c5a;
      margin: 0;
      white-space: nowrap;
    }
  }

  /* the microorganisms, the gram and the lab's result: their labels in a
     column, the texts in the rest of the width */
  .recent-culture-texts {
    column-gap: 12px;
    display: grid;
    grid-template-columns: max-content minmax(0, 1fr);
    margin: 0;
    row-gap: 4px;

    dt {
      color: #8c8c8c;
      font-size: 12px;
      line-height: 22px;
    }

    dd {
      color: #2e3c5a;
      margin: 0;
    }

    /* the dd's own colour would hide the card's muted one */
    dd.muted {
      color: #8c8c8c;
    }
  }

  .recent-culture-microorganisms {
    display: flex;
    flex-wrap: wrap;
    gap: 0 12px;
  }

  /* the gram is what the infectologist looks for first */
  .recent-culture-gram {
    border-left: 3px solid #d3adf7;
    color: #391085;
    font-weight: 500;
    padding-left: 8px;
  }
`;
