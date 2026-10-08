import styled, { css } from "styled-components";

import {
  COURSE_COLORS,
  DISCHARGE_COLOR,
  EVALUATION_COLORS,
  SCHEDULED_COLOR,
  TODAY_COLOR,
} from "../courseColors";

// fixed column with the drug of each row (--label-width), narrower on phones
// and when the timeline is embedded in another view
const LABEL_WIDTH = 360;
const LABEL_WIDTH_SMALL = 160;
const LABEL_WIDTH_COMPACT = 84;
// every day column has this width; long admissions scroll sideways
export const DAY_WIDTH = 34;

const GRID_LINE = "#f0f0f0";
const HATCH =
  "repeating-linear-gradient(-45deg, #fff 0 3px, rgba(0, 0, 0, 0.12) 3px 6px)";

export const Gantt = styled.div`
  --label-width: ${LABEL_WIDTH}px;

  &.compact {
    --label-width: ${LABEL_WIDTH_COMPACT}px;

    .label-day {
      font-size: 15px;
      text-align: center;
    }
  }

  @media (max-width: 768px) {
    --label-width: ${LABEL_WIDTH_SMALL}px;
  }

  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
`;

export const GanttScroll = styled.div`
  overflow-x: auto;
`;

export const GanttGrid = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Row = styled.div`
  border-bottom: 1px solid ${GRID_LINE};
  display: flex;
  min-height: 64px;

  &:last-child {
    border-bottom: 0;
  }

  &.row-header {
    background: #fafafa;
    min-height: 50px;
  }
`;

export const RowLabel = styled.div`
  background: inherit;
  background-color: #fff;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex: 0 0 var(--label-width);
  flex-direction: column;
  justify-content: center;
  left: 0;
  min-width: 0;
  padding: 6px 12px;
  position: sticky;
  z-index: 3;

  .row-header & {
    background-color: #fafafa;
  }

  .label-drug {
    align-items: center;
    display: flex;
    gap: 6px;
    min-width: 0;
  }

  .label-name {
    background: none;
    border: 0;
    color: #2e3c5a;
    cursor: pointer;
    font: inherit;
    font-weight: 600;
    overflow: hidden;
    padding: 0;
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;

    &:hover {
      text-decoration: underline;
    }
  }

  .label-info {
    align-items: center;
    display: flex;
    gap: 6px;
    margin-top: 4px;

    .ant-tag {
      margin: 0;
    }
  }

  .label-day {
    color: #2e3c5a;
  }

  .label-cycles {
    color: #8c8c8c;
    font-size: 12px;
    margin-top: 2px;
  }

  .label-dates {
    color: #8c8c8c;
    font-size: 12px;
    white-space: nowrap;

    @media (max-width: 768px) {
      display: none;
    }
  }
`;

export const Track = styled.div<{ $days: number }>`
  background-image: linear-gradient(
    to right,
    ${GRID_LINE} 1px,
    transparent 1px
  );
  background-size: ${DAY_WIDTH}px 100%;
  display: flex;
  flex: 0 0 ${(props) => props.$days * DAY_WIDTH}px;
  position: relative;

  &.track-header {
    background-image: none;
  }

  .marker-label {
    border-radius: 3px;
    color: #fff;
    font-size: 11px;
    font-weight: 600;
    line-height: 16px;
    padding: 0 4px;
    position: absolute;
    top: 0;
    transform: translateX(-50%);
    white-space: nowrap;
    z-index: 2;
  }

  .marker-label-today {
    background: ${TODAY_COLOR};
  }

  .marker-label-discharge {
    background: ${DISCHARGE_COLOR};
    top: auto;
    bottom: 0;
  }

  .planned-end {
    border-left: 2px solid ${DISCHARGE_COLOR};
    cursor: help;
    height: 30px;
    position: absolute;
    top: 50%;
    transform: translate(-1px, -50%);
    width: 8px;
    z-index: 2;

    &::after {
      border-bottom: 5px solid transparent;
      border-left: 7px solid ${DISCHARGE_COLOR};
      border-top: 5px solid transparent;
      content: "";
      left: 0;
      position: absolute;
      top: 0;
    }
  }

  .regimen-change {
    background: #fff;
    border: 2px solid #2e3c5a;
    border-radius: 2px;
    cursor: help;
    height: 10px;
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%) rotate(45deg);
    width: 10px;
    z-index: 2;
  }
`;

export const HeaderDay = styled.div`
  align-items: center;
  border-left: 1px solid ${GRID_LINE};
  color: #8c8c8c;
  display: flex;
  flex: 0 0 ${DAY_WIDTH}px;
  flex-direction: column;
  font-size: 11px;
  justify-content: center;
  line-height: 1.2;
  padding-top: 18px;

  .day-number {
    color: #2e3c5a;
    font-size: 12px;
    font-weight: 500;
  }

  .day-month {
    visibility: hidden;
  }

  &.month-start .day-month {
    visibility: visible;
  }

  &.weekend {
    background: #f5f5f5;
  }

  &.today .day-number {
    color: ${TODAY_COLOR};
    font-weight: 700;
  }
`;

export const Bar = styled.div<{ $color?: string }>`
  border-radius: 4px;

  &[role="button"]:hover {
    filter: brightness(0.9);
  }

  &[role="button"]:focus-visible {
    outline: 2px solid #2e3c5a;
    outline-offset: 2px;
  }

  height: 18px;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);

  &.bar-given {
    background: ${(props) => props.$color};
    cursor: pointer;
    min-width: 3px;
    z-index: 1;
  }

  &.bar-scheduled {
    background: ${SCHEDULED_COLOR};
    border-radius: 0 4px 4px 0;
    cursor: pointer;
    z-index: 1;
  }

  &.bar-planned {
    border: 2px dashed ${(props) => props.$color};
    opacity: 0.6;
  }

  &.bar-gap {
    background: ${HATCH};
    border: 1px solid rgba(0, 0, 0, 0.15);
    border-radius: 0;
    height: 18px;
    z-index: 1;
  }
`;

// a stroked glyph drawn on the marker of a conformity record
const glyph = (path: string, color: string) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'><path d='${path}' fill='none' stroke='${color}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>`,
  )}")`;
const CHECK = "M2.5 6.3 5 8.7 9.5 3.6";
const CROSS = "M3.3 3.3 8.7 8.7M8.7 3.3 3.3 8.7";

/**
 * The marker of a conformity record (its ::before), with a band of the same
 * color: a circle with a check when conforming and a square with a cross when
 * not, so the verdict does not depend on telling the colors apart
 */
const evaluationMarker = (left: string) => css`
  &::before {
    background-position: center;
    background-repeat: no-repeat;
    background-size: 11px;
    border: 2px solid #fff;
    border-radius: 50%;
    box-sizing: border-box;
    content: "";
    height: 15px;
    left: ${left};
    position: absolute;
    top: -5px;
    width: 15px;
  }

  &.conforming,
  &.conforming::before {
    background-color: ${EVALUATION_COLORS.conforming};
  }

  &.conforming::before {
    background-image: ${glyph(CHECK, "#fff")};
  }

  &.non-conforming,
  &.non-conforming::before {
    background-color: ${EVALUATION_COLORS.nonConforming};
  }

  &.non-conforming::before {
    background-image: ${glyph(CROSS, "#fff")};
    border-radius: 3px;
  }

  /* no longer holds: in the pending color, keeping the symbol of its verdict */
  &.invalidated,
  &.invalidated::before {
    background-color: ${EVALUATION_COLORS.invalidated};
  }

  &.invalidated.conforming::before {
    background-image: ${glyph(CHECK, EVALUATION_COLORS.invalidatedSymbol)};
  }

  &.invalidated.non-conforming::before {
    background-image: ${glyph(CROSS, EVALUATION_COLORS.invalidatedSymbol)};
  }
`;

// a conformity record: a band under the course bar for the days it is in
// force, with a marker where the review recorded it
export const Evaluation = styled.span`
  border-radius: 2px;
  cursor: help;
  height: 5px;
  min-width: 4px;
  position: absolute;
  top: calc(50% + 13px);
  z-index: 2;

  ${evaluationMarker("-7px")}

  /* the evaluation being filled, not saved yet: striped, with a hollow marker */
  &.draft {
    background-image: repeating-linear-gradient(
      -45deg,
      rgba(255, 255, 255, 0.55) 0 3px,
      transparent 3px 6px
    );
    height: 7px;
    top: calc(50% + 12px);
  }

  &.draft::before {
    background-color: #fff;
    border-color: currentColor;
    top: -4px;
  }

  &.draft.conforming {
    color: ${EVALUATION_COLORS.conforming};
  }

  &.draft.conforming::before {
    background-image: ${glyph(CHECK, EVALUATION_COLORS.conforming)};
  }

  &.draft.non-conforming {
    color: ${EVALUATION_COLORS.nonConforming};
  }

  &.draft.non-conforming::before {
    background-image: ${glyph(CROSS, EVALUATION_COLORS.nonConforming)};
  }

  &.undecided {
    background-color: #bfbfbf;
    color: #8c8c8c;
  }

  /* superseded, closed or expired: kept for the record, in a lighter tone */
  &.past {
    opacity: 0.45;
  }

  &:hover,
  &:focus-visible {
    opacity: 1;
    outline: none;
  }

  &:focus-visible::before {
    outline: 2px solid #2e3c5a;
  }
`;

export const Marker = styled.div`
  bottom: 0;
  pointer-events: none;
  position: absolute;
  top: 0;
  width: 0;
  z-index: 2;

  &.marker-today {
    border-left: 2px solid ${TODAY_COLOR};
  }

  &.marker-discharge {
    border-left: 2px dashed ${DISCHARGE_COLOR};
  }
`;

export const Legend = styled.div`
  border-top: 1px solid #e0e0e0;
  color: #595959;
  display: flex;
  flex-wrap: wrap;
  font-size: 12px;
  gap: 6px 18px;
  padding: 10px 12px;

  span {
    align-items: center;
    display: inline-flex;
    gap: 6px;
  }

  i {
    border-radius: 3px;
    display: inline-block;
    height: 10px;
    width: 18px;
  }

  .legend-given {
    background: ${COURSE_COLORS.active};
  }

  .legend-scheduled {
    background: ${SCHEDULED_COLOR};
  }

  .legend-planned {
    border: 2px dashed ${COURSE_COLORS.active};
    opacity: 0.6;
  }

  .legend-planned-end {
    border-left: 2px solid ${DISCHARGE_COLOR};
    border-radius: 0;
    height: 12px;
    position: relative;
    width: 8px;

    &::after {
      border-bottom: 4px solid transparent;
      border-left: 6px solid ${DISCHARGE_COLOR};
      border-top: 4px solid transparent;
      content: "";
      left: 0;
      position: absolute;
      top: 0;
    }
  }

  .legend-suspended {
    background: ${COURSE_COLORS.suspended};
  }

  .legend-finished {
    background: ${COURSE_COLORS.finished};
  }

  .legend-gap {
    background: ${HATCH};
    border: 1px solid rgba(0, 0, 0, 0.15);
  }

  .legend-evaluation {
    border-radius: 2px;
    height: 5px;
    margin-left: 7px;
    position: relative;

    ${evaluationMarker("-7px")}
  }

  .legend-change {
    background: #fff;
    border: 2px solid #2e3c5a;
    border-radius: 2px;
    height: 9px;
    transform: rotate(45deg);
    width: 9px;
  }
`;
