import styled from "styled-components";

import {
  PREDICTED_RESISTANT,
  PREDICTED_SUSCEPTIBLE,
  PREDICTED_UNKNOWN,
  accentColor,
  type IAccentProps,
} from "features/culture/cultureColors";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  /* the card centers its content for the exams carousel: the culture list
     instead fills it, so the first group sits right under the tabs */
  align-self: stretch;
  height: 100%;
  min-height: 0;
  /* below the card's own max-height breakpoint nothing caps the list */
  max-height: 222px;
`;

export const Scroll = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 5px;

  &::-webkit-scrollbar-track {
    background-color: #f5f5f5;
    border-radius: 10px;
  }

  &::-webkit-scrollbar {
    width: 8px;
    background-color: #f5f5f5;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #2e3c5a;
    border-radius: 10px;
  }
`;

// every drug of the card in a single table: one row per drug, the columns
// read across the groups instead of down two narrow columns of cards
export const Table = styled.table`
  width: 100%;
  /* separate, not collapse: the accent bar is the left border of the first
     cell, and a collapsed border would be shared with the row above */
  border-collapse: separate;
  border-spacing: 0;
  font-size: 13px;

  thead th {
    /* the list scrolls, the columns must not leave the rows without context */
    position: sticky;
    top: 0;
    z-index: 2;
    padding: 0 6px 4px;
    background: #fff;
    border-bottom: 1px solid #e0e0e0;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-align: left;
    text-transform: uppercase;
    white-space: nowrap;
    color: #6d7a94;
  }

  /* every column but the drug is as narrow as its content: the drug name is
     what identifies the row, and it gets the rest of the width */
  .cell-aware,
  .cell-prescribed,
  .cell-age,
  .cell-hint {
    width: 1%;
    white-space: nowrap;
  }

  .cell-prescribed {
    text-align: center;
  }

  .cell-hint {
    padding-left: 0;
  }
`;

export const Group = styled.tbody`
  .group-title {
    padding: 10px 6px 4px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-align: left;
    text-transform: uppercase;
    color: #6d7a94;

    > div {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .anticon {
      color: #a991d6;
    }

    .count {
      font-weight: 400;
    }
  }

  /* the predictions carry the colour of what was predicted, on the robot
     that marks them as predictions */
  &.culture-group-predictionResistant .group-title .anticon {
    color: ${PREDICTED_RESISTANT};
  }

  &.culture-group-predictionSusceptible .group-title .anticon {
    color: ${PREDICTED_SUSCEPTIBLE};
  }

  /* resistant and in use: the group the card exists to surface */
  &.culture-group-resistantInUse .group-title {
    color: #cf1322;

    .anticon {
      /* the header font is 11px, too small for the germ to read as one */
      font-size: 15px;
      color: #f44336;
    }
  }
`;

export const Item = styled.tr<IAccentProps & { $inUse?: boolean }>`
  /* the whole row opens the details */
  cursor: pointer;

  td {
    padding: 5px 6px;
    border-bottom: 1px solid #f0f0f0;
    background: #fff;
    vertical-align: middle;
  }

  /* resistant and in use: the same red, twice the bar — the row is found by
     weight and not by a colour the other three states do not have, and a
     one-pixel difference would not be seen at all */
  td:first-child {
    border-left: ${(props) => (props.$inUse ? "6px" : "3px")} solid
      ${accentColor};
  }

  .drug {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }

  .name {
    /* enough of the drug name to identify it: past this the marker beside it
       is what gives way, not the name */
    min-width: 85px;
    font-size: 14px;
    font-weight: ${(props) => (props.$inUse ? 600 : 400)};
    color: var(--nh-text-color);
    overflow-wrap: anywhere;
  }

  /* the drug is in the prescription being screened: on a resistant row this
     is the reason the item carries an alert */
  .prescribed {
    display: inline-flex;
    align-items: center;

    .anticon {
      font-size: 15px;
      color: #2e3c5a;
    }

    &.in-use .anticon {
      color: #f44336;
    }
  }

  /* what the group header does not say about the result */
  .marker {
    display: flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
    font-size: 12px;
    font-weight: 500;
    color: var(--nh-text-color);

    /* the robot marks the row as a prediction, in the colour of what was
       predicted: the same one the bar and the group header carry */
    .anticon {
      flex-shrink: 0;
      color: ${accentColor};
    }
  }

  /* how old the result is. The clock is what tells the number apart from
     the result next to it */
  .age {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 11px;
    font-weight: 500;
    white-space: nowrap;
    color: #6d7a94;

    .anticon {
      font-size: 10px;
    }
  }

  /* the row opens the details: the chevron says so without a hover */
  .details-hint {
    display: inline-flex;
    align-items: center;
    color: #b6bece;

    .anticon {
      font-size: 10px;
    }
  }

  &:hover td {
    background: #f7f7fb;
  }

  &:hover .details-hint {
    color: #2e3c5a;
  }

  &:focus-visible {
    outline: 2px solid #2e3c5a;
    outline-offset: -2px;
  }
`;

export const EmptyDescription = styled.div`
  .culture-empty-title {
    color: var(--nh-text-color);
    font-weight: 500;
  }

  /* the retention window is the reason the full report below still matters:
     it reads as a footnote, not as a second headline */
  .culture-empty-hint {
    margin-top: 2px;
    font-size: 12px;
    line-height: 1.4;
    color: #6d7a94;
  }
`;

// the predictions, folded away under the released results. They are not lab
// results, and below a card that holds none of them an open list of
// predictions was read as if it were the antibiogram
export const Predictions = styled.div<{ $standalone?: boolean }>`
  /* the fold is what separates the two readings: above it, what the lab
     released; below it, what is still a guess */
  margin-top: ${(props) => (props.$standalone ? "0" : "12px")};
  padding-top: ${(props) => (props.$standalone ? "0" : "10px")};
  border-top: ${(props) => (props.$standalone ? "none" : "1px dashed #d9dee8")};

  /* the prediction table sits under the toggle, not against it */
  .culture-table {
    margin-top: 10px;
  }
`;

// nothing came back from the lab: said outright, above the fold that hides
// the prediction standing in for it
export const NoReleased = styled.div`
  margin-bottom: 10px;

  .culture-no-released-title {
    font-weight: 500;
    color: var(--nh-text-color);
  }

  .culture-no-released-hint {
    margin-top: 2px;
    font-size: 12px;
    line-height: 1.4;
    color: #6d7a94;
  }
`;

export const PredictionsToggle = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 6px 8px;
  border: 1px dashed #c9d0dd;
  border-radius: 5px;
  background: #f7f7fb;
  font-size: 12px;
  font-weight: 500;
  color: #4a5670;
  cursor: pointer;
  text-align: left;

  > .anticon-robot {
    flex-shrink: 0;
    font-size: 14px;
    color: ${PREDICTED_UNKNOWN};
  }

  .toggle-label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* a predicted resistance is the reason to open the fold, so the closed
     toggle states how many are behind it */
  .toggle-alert {
    flex-shrink: 0;
    padding: 1px 6px;
    border-radius: 10px;
    background: ${PREDICTED_RESISTANT};
    font-size: 11px;
    font-weight: 600;
    color: #fff;
  }

  .toggle-chevron {
    flex-shrink: 0;
    margin-left: auto;
    font-size: 10px;
    color: #6d7a94;
  }

  &:hover {
    border-color: ${PREDICTED_UNKNOWN};
    background: #f2f0fa;
  }

  &:focus-visible {
    outline: 2px solid #2e3c5a;
    outline-offset: 1px;
  }
`;
