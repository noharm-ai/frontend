import styled, { css } from "styled-components";

import { EXAM_COLORS } from "../../courseColors";
import { Row, RowLabel } from "../CourseGantt.style";

// as tall as a course row without evaluations
export const EXAM_ROW_HEIGHT = 64;

const INK = "#2e3c5a";
const MUTED = "#8c8c8c";
const LINE = EXAM_COLORS.line;
const ALERT = EXAM_COLORS.alert;

// every row of the exams, across the label and the track, on a gray-blue of
// its own: the antimicrobial rows stay white (Row, RowLabel)
const examBlock = css`
  --row-bg: ${EXAM_COLORS.background};
  --row-hover: ${EXAM_COLORS.hover};
  --grid-line: ${EXAM_COLORS.gridLine};
`;

// the exams under the courses start with a row naming them
export const ExamGroupRow = styled(Row)`
  ${examBlock}
  /* a strip a shade darker than the rows, with no tint under the pointer */
  --row-bg: ${EXAM_COLORS.header};
  --row-hover: ${EXAM_COLORS.header};

  --row-border-top: 6px;

  border-top: var(--row-border-top) solid ${EXAM_COLORS.divider};
  min-height: 32px;

  .exam-group {
    align-items: center;
    display: flex;
    gap: 8px;
  }

  .exam-group-title {
    color: ${MUTED};
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  /* at the right end, over the buttons that take each exam out */
  .exam-group-add {
    color: ${MUTED};
    margin-left: auto;
  }

  .exam-group-collapse {
    align-items: center;
    background: none;
    border: 0;
    border-radius: 4px;
    cursor: pointer;
    display: inline-flex;
    gap: 6px;
    margin-left: -4px;
    padding: 2px 4px;

    &:hover {
      background: rgba(46, 60, 90, 0.06);
    }

    &:focus-visible {
      outline: 2px solid ${INK};
    }
  }

  .exam-group-chevron {
    color: ${MUTED};
    font-size: 10px;
    transition: transform 0.2s;
  }

  .exam-group-collapse.collapsed .exam-group-chevron {
    transform: rotate(-90deg);
  }
`;

// when the history failed to load
export const ExamStateRow = styled(Row)`
  ${examBlock}

  min-height: 48px;

  > ${RowLabel} {
    align-items: flex-start;
    color: #595959;
    font-size: 13px;
    gap: 6px;
  }
`;

export const ExamRow = styled(Row)`
  ${examBlock}

  min-height: ${EXAM_ROW_HEIGHT}px;

  .exam-label-name {
    align-items: center;
    display: flex;
    gap: 6px;
    min-width: 0;
  }

  .exam-name {
    color: ${INK};
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .exam-unit {
    color: ${MUTED};
    font-size: 12px;
    white-space: nowrap;
  }

  .exam-remove {
    color: ${MUTED};
    flex: none;
    margin-left: auto;
  }

  .exam-label-info {
    align-items: baseline;
    color: ${MUTED};
    display: flex;
    flex-wrap: wrap;
    font-size: 12px;
    gap: 2px 8px;
    margin-top: 2px;
  }

  .exam-latest {
    color: ${INK};
    font-size: 13px;
  }

  .exam-latest.alert {
    color: ${ALERT};
  }

  .exam-sparkline {
    left: 0;
    overflow: visible;
    position: absolute;
    top: 0;
    z-index: 1;
  }

  /* dashed, so nothing on the row reads as a solid course bar */
  .exam-line {
    fill: none;
    stroke: ${LINE};
    stroke-dasharray: 4 3;
    stroke-linejoin: round;
    stroke-width: 1.5;
  }

  .exam-point {
    cursor: help;
  }

  .exam-point-target {
    fill: transparent;
  }

  /* in range: hollow; out of it: filled in red with a white border */
  .exam-point-dot {
    fill: #fff;
    stroke: ${LINE};
    stroke-width: 2;
  }

  .exam-point.alert .exam-point-dot {
    fill: ${ALERT};
    stroke: #fff;
  }

  .exam-point:hover .exam-point-dot {
    r: 5;
  }
`;
