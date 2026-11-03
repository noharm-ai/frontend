import { ReactNode } from "react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { Button, Tooltip } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

import NumericValue from "components/NumericValue";
import { formatDate } from "utils/date";

import { IExamSeries } from "../../exams";
import { ITimelineRange, toPercent } from "../../timeline";
import { DAY_WIDTH, RowLabel, Track } from "../CourseGantt.style";
import {
  EXAM_ROW_HEIGHT,
  ExamGroupRow,
  ExamRow,
  ExamStateRow,
} from "./ExamRows.style";

type Status = "idle" | "loading" | "succeeded" | "failed";

export interface IGanttExams {
  // the exams the timeline plots (getTimelineExams)
  series: IExamSeries[];
  // of the history the series come from
  status: Status;
  onRetry: () => void;
}

interface ExamRowsProps extends IGanttExams {
  range: ITimelineRange;
  // the lines of today and the discharge, as the course rows have them
  markers: ReactNode;
}

// the line keeps clear of the row's edges
const PADDING = 10;

const formatNumber = (value: number) => value.toLocaleString("pt-BR");

// the results and the reference both fit, with some room above and below
const valueRange = (series: IExamSeries) => {
  const values = series.points.map((point) => point.value);
  if (series.reference) {
    values.push(series.reference.min, series.reference.max);
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = max > min ? (max - min) * 0.1 : Math.abs(max) * 0.1 || 1;
  return { min: min - pad, max: max + pad };
};

/**
 * The history of an exam on the days of the timeline, under the courses: a
 * line through its results on their own scale, the reference of the segment
 * as a band behind it, and the results out of it in red
 */
function ExamSparkline({
  series,
  range,
}: {
  series: IExamSeries;
  range: ITimelineRange;
}) {
  const { t } = useTranslation();
  const width = range.days.length * DAY_WIDTH;
  const height = EXAM_ROW_HEIGHT;
  const values = valueRange(series);
  const x = (date: string) => (toPercent(date, range) / 100) * width;
  const y = (value: number) =>
    PADDING +
    (1 - (value - values.min) / (values.max - values.min)) *
      (height - 2 * PADDING);
  const unit = series.unit ? ` ${series.unit}` : "";
  // the results before the timeline starts are left out (CourseGantt)
  const points = series.points.filter(
    (point) =>
      !dayjs(point.date).isBefore(range.start) &&
      dayjs(point.date).isBefore(range.end),
  );

  return (
    <svg
      className="exam-sparkline"
      width={width}
      height={height}
      role="img"
      aria-label={series.name}
    >
      {series.reference && (
        <rect
          className="exam-reference"
          x={0}
          width={width}
          y={y(series.reference.max)}
          height={y(series.reference.min) - y(series.reference.max)}
        />
      )}
      <polyline
        className="exam-line"
        points={points
          .map((point) => `${x(point.date)},${y(point.value)}`)
          .join(" ")}
      />
      {points.map((point, index) => (
        <Tooltip
          // two results can share a moment
          key={`${point.date}-${index}`}
          title={
            <div>
              <div>{formatDate(point.date, "DD/MM/YYYY HH:mm")}</div>
              <strong>
                {formatNumber(point.value)}
                {unit}
              </strong>
              {point.alert && (
                <div>{t("infectionControl.exams.timelineOutOfRange")}</div>
              )}
            </div>
          }
        >
          <g
            className={`exam-point ${point.alert ? "alert" : ""}`}
            data-testid="exam-point"
          >
            {/* a target larger than the dot */}
            <circle
              className="exam-point-target"
              cx={x(point.date)}
              cy={y(point.value)}
              r={9}
            />
            <circle
              className="exam-point-dot"
              cx={x(point.date)}
              cy={y(point.value)}
              r={4}
            />
          </g>
        </Tooltip>
      ))}
    </svg>
  );
}

/**
 * The exams of the timeline (TIMELINE_EXAMS), a row each under the courses
 * (CourseGantt), on the same days, so their results read against the courses
 * started and changed. Each exam has its own scale: they differ in unit and in
 * magnitude. The history is the one "Ver todos" shows
 */
export function ExamRows({
  series,
  status,
  range,
  markers,
  onRetry,
}: ExamRowsProps) {
  const { t } = useTranslation();

  const group = (
    <ExamGroupRow
      data-testid="exam-timeline-group"
      data-kb="infectionControl.antimicrobials.exams"
    >
      <RowLabel>
        <div className="exam-group">
          <span className="exam-group-title">
            {t("infectionControl.exams.timelineGroup")}
          </span>
        </div>
      </RowLabel>
      <Track $days={range.days.length}>{markers}</Track>
    </ExamGroupRow>
  );

  if (status === "failed") {
    return (
      <>
        {group}
        <ExamStateRow data-testid="exam-timeline-error">
          <RowLabel>
            <span>{t("infectionControl.exams.timelineLoadError")}</span>
            <Button size="small" icon={<ReloadOutlined />} onClick={onRetry}>
              {t("infectionControl.retry")}
            </Button>
          </RowLabel>
          <Track $days={range.days.length}>{markers}</Track>
        </ExamStateRow>
      </>
    );
  }

  // while the history loads the timeline shows the courses alone
  if (status !== "succeeded" || series.length === 0) {
    return null;
  }

  return (
    <>
      {group}
      {series.map((item) => {
        const latest = item.points[item.points.length - 1];

        return (
          <ExamRow key={item.key} data-testid="exam-timeline-row">
            <RowLabel>
              <div className="exam-label-name">
                <Tooltip title={item.name}>
                  <span className="exam-name">{item.name}</span>
                </Tooltip>
                {item.unit && <span className="exam-unit">{item.unit}</span>}
              </div>
              <div className="exam-label-info">
                <strong
                  className={`exam-latest ${latest.alert ? "alert" : ""}`}
                >
                  <NumericValue value={latest.value} />
                </strong>
                <span>{formatDate(latest.date, "DD/MM")}</span>
                {item.reference && (
                  <span>
                    {t("infectionControl.exams.timelineReference", {
                      min: formatNumber(item.reference.min),
                      max: formatNumber(item.reference.max),
                    })}
                  </span>
                )}
              </div>
            </RowLabel>
            <Track $days={range.days.length}>
              <ExamSparkline series={item} range={range} />
              {markers}
            </Track>
          </ExamRow>
        );
      })}
    </>
  );
}
