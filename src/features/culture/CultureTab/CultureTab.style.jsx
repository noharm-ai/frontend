import styled from "styled-components";

import { get } from "styles/utils";

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

// the left bar carries the whole reading of the row. A prediction is checked
// before resistance on purpose: a predicted resistant drug is still a pending
// collection, and it must not be read in the same red as a released
// antibiogram
const accentColor = (props) => {
  if (props.$prediction) return "#a991d6";
  if (props.$resistant) return "#f44336";
  if (props.$susceptible) return "#7ebe9a";

  // a result the backend could not classify (CultureResultTypeEnum.UNKNOWN):
  // it is not a sensitivity, so it does not get the green bar
  return "#e0e0e0";
};

export const Item = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
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

  .marker {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
    color: var(--nh-text-color);

    .anticon {
      color: #a991d6;
    }
  }

  /* how old the result is: a footnote on the row, never competing with the
     drug name or with the marker that states the result */
  .age {
    flex-shrink: 0;
    font-size: 11px;
    font-weight: 500;
    white-space: nowrap;
    color: #6d7a94;
  }

  &:hover {
    box-shadow: 0px 1px 4px 0px rgb(0 0 0 / 16%);
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
