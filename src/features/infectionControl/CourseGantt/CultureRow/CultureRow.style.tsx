import styled from "styled-components";

import { ExamRow } from "../ExamRows/ExamRows.style";

// collections close in time stack this far apart (--culture-lanes)
export const CULTURE_LANE = 18;

// the row of the culture collections, in the group of the exams (its tint),
// lower than an exam row: marks, no line
export const CultureRowBox = styled(ExamRow)`
  min-height: calc(40px + (var(--culture-lanes, 1) - 1) * ${CULTURE_LANE}px);

  .culture-row-title {
    color: #2e3c5a;
    font-weight: 600;
  }

  .culture-row-count {
    color: #8c8c8c;
    font-size: 12px;
  }
`;

// a collection, on the moment it was collected: hollow when nothing grew, red
// when it found a microorganism
export const CultureMark = styled.button`
  background: #fff;
  border: 2px solid #8c8c8c;
  border-radius: 50%;
  cursor: pointer;
  height: 12px;
  padding: 0;
  position: absolute;
  transform: translate(-50%, -50%);
  transition: transform 0.15s;
  width: 12px;
  z-index: 3;

  &.isolated {
    background: #cf1322;
    border-color: #cf1322;
  }

  &:hover,
  &:focus-visible {
    outline: none;
    transform: translate(-50%, -50%) scale(1.35);
  }

  &:focus-visible {
    box-shadow:
      0 0 0 2px #fff,
      0 0 0 4px #2e3c5a;
  }
`;
