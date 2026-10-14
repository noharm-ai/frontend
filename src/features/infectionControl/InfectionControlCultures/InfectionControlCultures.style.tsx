import styled from "styled-components";

export const CulturesBox = styled.div`
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;

  &.by-drug {
    padding: 8px 12px;
  }

  .muted {
    color: #8c8c8c;
  }

  .culture-exam {
    color: #2e3c5a;
    font-weight: 500;
  }

  /* a row opens the history of its exam and material */
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

export const CulturesHeading = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  margin-bottom: 12px;

  .section-title,
  .pane-title {
    margin: 0;
  }

  .pane-title {
    color: #2e3c5a;
    font-size: 15px;
    font-weight: 600;
  }

  .legend {
    color: #8c8c8c;
  }
`;

// the two views of the cultures side by side, the headings on a row of their
// own so the boxes line up however a heading wraps. The width is the
// section's, not the screen's: the sider takes a share of the screen when open.
// Stacked when narrower than both views need
export const CulturesPanes = styled.div`
  container-type: inline-size;

  .panes {
    display: grid;
    gap: 0 16px;
    grid-template-areas: "exam-heading" "exam" "drug-heading" "drug";
    grid-template-columns: minmax(0, 1fr);
  }

  .pane-exam-heading {
    grid-area: exam-heading;
  }

  .pane-exam {
    grid-area: exam;
  }

  .pane-drug-heading {
    grid-area: drug-heading;
    margin-top: 16px;
  }

  .pane-drug {
    grid-area: drug;
  }

  .pane-exam-heading,
  .pane-drug-heading {
    align-self: end;
  }

  .pane-exam,
  .pane-drug {
    align-self: start;
  }

  @container (min-width: 1100px) {
    .panes {
      grid-template-areas:
        "exam-heading drug-heading"
        "exam drug";
      grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
    }

    .pane-drug-heading {
      margin-top: 0;
    }
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
