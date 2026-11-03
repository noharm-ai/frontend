import styled from "styled-components";

import { EXAM_COLORS } from "../../courseColors";
import { Row, RowLabel } from "../CourseGantt.style";

// as tall as a course row without evaluations
export const EXAM_ROW_HEIGHT = 64;

const INK = "#2e3c5a";
const MUTED = "#8c8c8c";
const LINE = EXAM_COLORS.line;
const ALERT = EXAM_COLORS.alert;

// the exams under the courses start with a row naming them
export const ExamGroupRow = styled(Row)`
  background: #fafafa;
  border-top: 1px solid #e0e0e0;
  min-height: 32px;

  /* the label is sticky over the track, so it carries the tint too */
  > ${RowLabel} {
    background-color: #fafafa;
  }

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
`;

// when the history failed to load
export const ExamStateRow = styled(Row)`
  min-height: 48px;

  > ${RowLabel} {
    align-items: flex-start;
    color: #595959;
    font-size: 13px;
    gap: 6px;
  }
`;

export const ExamRow = styled(Row)`
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

  .exam-reference {
    fill: ${EXAM_COLORS.reference};
  }

  .exam-line {
    fill: none;
    stroke: ${LINE};
    stroke-linejoin: round;
    stroke-width: 2;
  }

  .exam-point {
    cursor: help;
  }

  .exam-point-target {
    fill: transparent;
  }

  .exam-point-dot {
    fill: ${LINE};
    stroke: #fff;
    stroke-width: 2;
  }

  .exam-point.alert .exam-point-dot {
    fill: ${ALERT};
  }

  .exam-point:hover .exam-point-dot {
    r: 5;
  }
`;
