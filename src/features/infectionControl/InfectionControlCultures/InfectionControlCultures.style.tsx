import styled from "styled-components";

// one card for the cultures: the title beside the tabs of its two views, the
// summary by exam and the antibiogram by drug
export const CulturesBox = styled.div`
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow:
    0 1px 2px 0 rgba(0, 0, 0, 0.03),
    0 1px 6px -1px rgba(0, 0, 0, 0.02),
    0 2px 4px 0 rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;

  /* the title and the tab bar stay, the open view fills the rest when the
     card is given a height (beside the exams card): the summary scrolls in
     it, the list by drug scrolls on its own, under its sticky header */
  .ant-tabs {
    flex: 1;
    min-height: 0;
  }

  .ant-tabs-body-holder,
  .cultures-body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }

  .ant-tabs-body,
  .ant-tabs-content-active {
    height: 100%;
  }

  /* the page's section title, as the timeline's */
  .section-title {
    color: #2e3c5a;
    font-size: 18px;
    font-weight: 600;
    margin: 0 24px 0 0;
  }

  .cultures-header {
    border-bottom: 1px solid #f0f0f0;
    padding: 12px 16px;
  }

  .ant-tabs-nav {
    margin: 0;
    padding: 0 16px;
  }

  .legend {
    color: #8c8c8c;
    padding: 8px 16px;
  }

  /* padded rather than its content given margins: the culture list is as
     wide as its parent, and a margin pushed it past the right edge */
  .culture-pane.by-drug {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 0 12px 8px;

    /* the screening caps the list (CultureTab maxHeight); here it takes what
       the card leaves it */
    .by-drug-list {
      display: flex;
      flex: 1;
      min-height: 0;

      > div {
        max-height: none;
      }
    }

    .legend {
      padding: 8px 4px;
    }
  }

  .muted {
    color: #8c8c8c;
  }

  /* a text of the lab cut at two lines: the whole of it is where the
     culture opens */
  .clamp {
    -webkit-box-orient: vertical;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }

  .cultures-loading {
    display: flex;
    justify-content: center;
    padding: 32px 0;
  }

  .culture-exam {
    color: #2e3c5a;
    font-weight: 500;
  }

  /* a collection of the history opens its antibiogram */
  .culture-row {
    cursor: pointer;
  }

  .culture-row:focus-visible > td {
    background: #f0f5ff;
  }

  .culture-row:focus-visible {
    outline: none;
  }

  .culture-date {
    white-space: nowrap;
  }

  .culture-material {
    color: #8c8c8c;
    font-size: 12px;
  }

  .culture-microorganism {
    color: #2e3c5a;
    font-style: italic;
  }
`;

// the gram is what the infectologist looks for first: it stands out of the row
export const Gram = styled.span`
  background: #f9f0ff;
  border: 1px solid #d3adf7;
  border-radius: 4px;
  color: #391085;
  display: inline-block;
  font-weight: 500;
  padding: 0 6px;
`;

// the lab's result: label/value lines when it comes as HTML, the lines of the
// text when it comes plain
export const CultureResult = styled.div`
  color: #2e3c5a;

  &.plain {
    white-space: pre-line;
  }

  label {
    color: #595959;
    font-weight: 600;
  }

  p {
    margin: 0;
  }
`;

export const CulturesError = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
`;
