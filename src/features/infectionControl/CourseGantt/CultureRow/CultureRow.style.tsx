import styled from "styled-components";

import { ExamRow } from "../ExamRows/ExamRows.style";

const ISOLATED = "#cf1322";
const NONE = "#8c8c8c";

// the row of the culture collections, in the group of the exams (its tint),
// lower than an exam row: a mark per day, always one line
export const CultureRowBox = styled(ExamRow)`
  min-height: 40px;

  .culture-row-title {
    color: #2e3c5a;
    font-weight: 600;
  }

  .culture-row-count {
    color: #8c8c8c;
    font-size: 12px;
  }
`;

// the collections of a day, in the middle of it: a gray ring when nothing
// grew, a red one when one found a microorganism (a ring, not a disc: the
// timeline has enough solid color); larger, with their count, when several
export const CultureMark = styled.button`
  align-items: center;
  background: #fff;
  border: 2px solid ${NONE};
  border-radius: 50%;
  color: ${NONE};
  cursor: pointer;
  display: flex;
  font-size: 10px;
  font-weight: 700;
  height: 12px;
  justify-content: center;
  line-height: 1;
  padding: 0;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  transition: transform 0.15s;
  width: 12px;
  z-index: 3;

  &.several {
    height: 18px;
    width: 18px;
  }

  &.isolated {
    border-color: ${ISOLATED};
    color: ${ISOLATED};
  }

  &:hover,
  &:focus-visible {
    outline: none;
    transform: translate(-50%, -50%) scale(1.2);
  }

  &:focus-visible {
    box-shadow:
      0 0 0 2px #fff,
      0 0 0 4px #2e3c5a;
  }
`;

// the collections of a day, in the popover of its mark: the day on top, then
// a line each that opens it
export const CultureDay = styled.div`
  max-width: 340px;
  min-width: 260px;

  header {
    align-items: baseline;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    gap: 8px;
    justify-content: space-between;
    padding: 10px 14px 8px;

    strong {
      color: #2e3c5a;
    }

    span {
      color: #8c8c8c;
      font-size: 12px;
    }
  }

  ul {
    list-style: none;
    margin: 0;
    max-height: 300px;
    overflow-y: auto;
    padding: 4px;
  }

  button {
    align-items: flex-start;
    background: none;
    border: 0;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    gap: 10px;
    padding: 8px 10px;
    text-align: left;
    width: 100%;

    &:hover,
    &:focus-visible {
      background: #f4f8fb;
      outline: none;

      .day-open {
        color: #2e3c5a;
      }
    }
  }

  .day-time {
    color: #8c8c8c;
    flex: none;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    padding-top: 2px;
  }

  .day-body {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
  }

  .day-exam {
    color: #2e3c5a;
    font-weight: 600;
  }

  .day-material {
    color: #8c8c8c;
    font-size: 12px;
  }

  .day-result {
    color: #595959;
    font-size: 12px;
    margin-top: 2px;

    &.isolated {
      color: ${ISOLATED};
      font-style: italic;
    }
  }

  .day-open {
    align-self: center;
    color: #bfbfbf;
    font-size: 10px;
  }
`;
