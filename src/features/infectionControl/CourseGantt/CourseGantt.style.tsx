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
// conformity records stack under the course bar, one line each (--lane), and
// a row grows by this much for every line past the first (--lanes)
const EVALUATION_LANE = 17;
const ROW_HEIGHT = 64;
// the bars sit this far down the track: halfway, raised by half the extra
// lines so the bar and its records stay centered in the row
const BAR_CENTER = "var(--bar-center, 50%)";

const GRID_LINE = "#f0f0f0";
// under the pointer: the row of its drug and the column of its day (the label
// is sticky over the track, so its tint has to be opaque)
const HOVER_ROW = "#f4f8fb";
const HOVER_DAY = "rgba(46, 60, 90, 0.06)";
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

// --hover-day: the index of the day column under the pointer, set while the
// pointer is over a track (.hovering-day)
export const GanttGrid = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Row = styled.div`
  --bar-center: calc(50% - (var(--lanes, 1) - 1) * ${EVALUATION_LANE / 2}px);

  border-bottom: 1px solid ${GRID_LINE};
  display: flex;
  min-height: calc(
    ${ROW_HEIGHT}px + (var(--lanes, 1) - 1) * ${EVALUATION_LANE}px
  );

  &:last-child {
    border-bottom: 0;
  }

  &.row-header {
    background: #fff;
    min-height: 50px;
  }

  &:not(.row-header):hover {
    background-color: ${HOVER_ROW};
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

  ${Row}:not(.row-header):hover & {
    background-color: ${HOVER_ROW};
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

  /* the column of the day under the pointer, behind the bars */
  &::before {
    background: ${HOVER_DAY};
    bottom: 0;
    content: "";
    display: none;
    left: calc(var(--hover-day, 0) * ${DAY_WIDTH}px);
    pointer-events: none;
    position: absolute;
    top: 0;
    width: ${DAY_WIDTH}px;
  }

  .hovering-day &::before {
    display: block;
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
    top: ${BAR_CENTER};
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
    top: ${BAR_CENTER};
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
  top: ${BAR_CENTER};
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
const EXCLAMATION = "M6 2.8v4.2M6 9.2v.1";

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

  /* no longer holds: its verdict up to the first open reason (--split), the
     pending color from then on */
  &.invalidated {
    background-image: linear-gradient(
      to right,
      transparent var(--split, 50%),
      ${EVALUATION_COLORS.invalidated} var(--split, 50%)
    );
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
  top: calc(${BAR_CENTER} + 13px + var(--lane, 0) * ${EVALUATION_LANE}px);
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
    top: calc(${BAR_CENTER} + 12px + var(--lane, 0) * ${EVALUATION_LANE}px);
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

// where a conformity record turned pending: a mark with an exclamation on the
// band, at the first open reason
export const EvaluationPending = styled.span`
  background: ${EVALUATION_COLORS.invalidated}
    ${glyph(EXCLAMATION, EVALUATION_COLORS.invalidatedSymbol)} center / 11px
    no-repeat;
  border: 2px solid #fff;
  border-radius: 50%;
  box-sizing: border-box;
  cursor: help;
  height: 15px;
  position: absolute;
  top: calc(${BAR_CENTER} + 8px + var(--lane, 0) * ${EVALUATION_LANE}px);
  transform: translateX(-50%);
  width: 15px;
  z-index: 3;

  &:focus-visible {
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

// title and actions of the timeline, fixed above the grid that scrolls sideways
export const GanttHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  justify-content: space-between;
  padding: 10px 12px 10px 16px;

  .gantt-title {
    color: #2e3c5a;
    font-size: 18px;
    font-weight: 600;
    margin: 0;
  }

  .gantt-actions {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 8px 16px;
    margin-left: auto;
  }

  .gantt-toggle {
    align-items: center;
    color: #595959;
    cursor: pointer;
    display: inline-flex;
    gap: 8px;
  }
`;

// the body of the legend popover: the symbols of the timeline, by group
export const Legend = styled.div`
  color: #595959;
  display: grid;
  gap: 16px 40px;
  grid-template-columns: repeat(2, auto);
  max-width: min(640px, calc(100vw - 48px));
  padding: 4px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }

  section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  h4 {
    color: #2e3c5a;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.08em;
    margin: 0;
    text-transform: uppercase;
  }

  /* every symbol centered in a slot of the same width, so the labels line up */
  span {
    align-items: center;
    display: grid;
    gap: 10px;
    grid-template-columns: 28px 1fr;
  }

  i {
    border-radius: 3px;
    display: inline-block;
    height: 10px;
    justify-self: center;
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
