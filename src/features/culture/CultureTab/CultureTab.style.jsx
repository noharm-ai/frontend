import styled from "styled-components";

import { get } from "styles/utils";
import {
  PREDICTED_RESISTANT,
  PREDICTED_SUSCEPTIBLE,
  PREDICTED_UNKNOWN,
  accentColor,
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

export const Group = styled.div`
  & + & {
    margin-top: 10px;
  }

  .group-title {
    /* the list scrolls, the header must not leave its rows without context */
    position: sticky;
    top: 0;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 5px;
    padding-bottom: 5px;
    background: #fff;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #6d7a94;

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

// mirrors the exams grid (components/PrescriptionCard.jsx .exam-list)
export const List = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  column-gap: 10px;
  row-gap: 8px;

  @media (min-width: ${get("breakpoints.md")}) {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }

  @media only screen and (min-width: 1515px) {
    column-gap: 15px;
  }
`;

export const Item = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  padding: 5px;
  border: 1px solid #e0e0e0;
  /* resistant and in use: the same red, twice the bar — the row is found by
     weight and not by a colour the other three states do not have, and a
     one-pixel difference would not be seen at all */
  border-left: ${(props) => (props.$inUse ? "6px" : "3px")} solid ${accentColor};
  border-radius: 5px;
  background: #fff;
  /* the whole row opens the details */
  cursor: pointer;

  .name {
    flex: 1;
    /* enough of the drug name to identify it: past this the marker beside it
       is what gives way, not the name */
    min-width: 85px;
    font-size: 14px;
    font-weight: ${(props) => (props.$inUse ? 600 : 400)};
    color: var(--nh-text-color);
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  /* the drug is in the prescription being screened: on a resistant row this
     is the reason the item carries an alert */
  .prescribed {
    display: flex;
    align-items: center;
    flex-shrink: 0;

    .anticon {
      font-size: 15px;
      color: #2e3c5a;
    }

    &.in-use .anticon {
      font-size: 16px;
      color: #f44336;
    }
  }

  /* what the group header does not say about the result. It is the drug name
     that identifies the row, so this is what gives way when the row runs out
     of space */
  .marker {
    display: flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
    overflow: hidden;
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
    color: var(--nh-text-color);

    span {
      text-overflow: ellipsis;
      overflow: hidden;
    }

    /* the robot marks the row as a prediction, in the colour of what was
       predicted: the same one the bar and the group header carry */
    .anticon {
      flex-shrink: 0;
      color: ${accentColor};
    }
  }

  /* how old the result is: a footnote on the row, never competing with the
     drug name or with the marker that states the result. The clock is what
     tells the number apart from the result next to it */
  .age {
    display: flex;
    align-items: center;
    gap: 3px;
    flex-shrink: 0;
    font-size: 11px;
    font-weight: 500;
    white-space: nowrap;
    color: #6d7a94;

    .anticon {
      font-size: 10px;
    }
  }

  /* the row opens the details: the chevron says so without a hover, which is
     the only thing the shadow could say */
  .details-hint {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    /* it belongs to the row, not to the badge it sits next to */
    margin-left: -1px;
    color: #b6bece;

    .anticon {
      font-size: 10px;
    }
  }

  &:hover {
    box-shadow: 0px 1px 4px 0px rgb(0 0 0 / 16%);

    .details-hint {
      color: #2e3c5a;
    }
  }

  &:focus-visible {
    outline: 2px solid #2e3c5a;
    outline-offset: 1px;
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
export const Predictions = styled.div`
  /* the fold is what separates the two readings: above it, what the lab
     released; below it, what is still a guess */
  margin-top: ${(props) => (props.$standalone ? "0" : "12px")};
  padding-top: ${(props) => (props.$standalone ? "0" : "10px")};
  border-top: ${(props) => (props.$standalone ? "none" : "1px dashed #d9dee8")};

  /* the first prediction group sits under the toggle, not against it */
  .culture-group {
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
