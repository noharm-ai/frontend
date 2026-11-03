import { ReactNode, useState } from "react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { Button, Popover, Select, Tooltip } from "antd";
import {
  CloseOutlined,
  DownOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

import NumericValue from "components/NumericValue";
import { formatDate } from "utils/date";

import { IExamOption, IExamSeries } from "../../exams";
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
  // the exams the timeline plots, in the order they were added
  series: IExamSeries[];
  // the other exams of the history, to add
  options: IExamOption[];
  // of the history the series come from
  status: Status;
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  onRetry: () => void;
}

interface ExamRowsProps extends IGanttExams {
  range: ITimelineRange;
  // the lines of today and the discharge, as the course rows have them
  markers: ReactNode;
  // the viewer hid the exams: the header alone stays, to show them again
  hidden?: boolean;
  // the switch on the header; none when the timeline is embedded (compact)
  onToggleHidden?: (show: boolean) => void;
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
 * The history of an exam on the days of the timeline, under the courses, drawn
 * as a chart and not as a bar: a dashed line through its results on their own
 * scale, the reference of the segment as a green band behind it,
 * what lies out of it tinted red (while the pointer is over the row), the results in it as hollow dots and
 * the ones out of it filled in red
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
  // the reference spans the days with results, half a day past the first and
  // the last, so a single result has one too (oldest first: toPoints)
  const bandStart =
    points.length > 0 ? Math.max(0, x(points[0].date) - DAY_WIDTH / 2) : 0;
  const bandEnd =
    points.length > 0
      ? Math.min(width, x(points[points.length - 1].date) + DAY_WIDTH / 2)
      : 0;

  return (
    <svg
      className="exam-sparkline"
      width={width}
      height={height}
      role="img"
      aria-label={series.name}
    >
      {series.reference && points.length > 0 && (
        <g className="exam-reference-band" data-testid="exam-reference">
          {/* out of the reference: above its top and below its bottom */}
          <rect
            className="exam-reference-out"
            x={bandStart}
            width={bandEnd - bandStart}
            y={0}
            height={Math.max(0, y(series.reference.max))}
          />
          <rect
            className="exam-reference-out"
            x={bandStart}
            width={bandEnd - bandStart}
            y={y(series.reference.min)}
            height={Math.max(0, height - y(series.reference.min))}
          />
          <rect
            className="exam-reference"
            x={bandStart}
            width={bandEnd - bandStart}
            y={y(series.reference.max)}
            height={y(series.reference.min) - y(series.reference.max)}
          />
        </g>
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
 * The exams of the timeline, a row each under the courses
 * (CourseGantt), on the same days, so their results read against the courses
 * started and changed. Each exam has its own scale: they differ in unit and in
 * magnitude. It opens with some (TIMELINE_EXAMS); "+" adds any other exam of
 * the history, the one "Ver todos" shows, and each row can be taken out
 */
export function ExamRows({
  series,
  options,
  status,
  range,
  markers,
  hidden = false,
  onAdd,
  onRemove,
  onRetry,
  onToggleHidden,
}: ExamRowsProps) {
  const { t } = useTranslation();
  const [adding, setAdding] = useState(false);
  // a new picker every time it opens: none of the last search or list is left
  const [pickerKey, setPickerKey] = useState(0);
  const openPicker = (open: boolean) => {
    if (open) setPickerKey((key) => key + 1);
    setAdding(open);
  };

  // searched by name; its list opens inside the popover, so a pick does not
  // count as a click outside of it
  const picker = (
    <Select
      key={pickerKey}
      data-testid="exam-timeline-picker"
      className="exam-picker"
      showSearch
      autoFocus
      defaultOpen
      value={null}
      placeholder={t("infectionControl.exams.timelineSearch")}
      optionFilterProp="label"
      options={options.map((option) => ({
        value: option.id,
        label: option.name,
      }))}
      onChange={(id: string) => {
        setAdding(false);
        onAdd(id);
      }}
      getPopupContainer={(trigger) => trigger.parentElement ?? document.body}
      style={{ width: 260 }}
    />
  );

  const group = (
    <ExamGroupRow
      data-testid="exam-timeline-group"
      data-kb="infectionControl.antimicrobials.exams"
    >
      <RowLabel>
        <div className="exam-group">
          {onToggleHidden ? (
            // an accordion: the title collapses the section to this header
            <Tooltip
              placement="topLeft"
              title={t(
                hidden
                  ? "infectionControl.exams.timelineShow"
                  : "infectionControl.exams.timelineHide",
              )}
            >
              <button
                type="button"
                className={`exam-group-collapse ${hidden ? "collapsed" : ""}`}
                data-testid="toggle-exams"
                aria-expanded={!hidden}
                onClick={() => onToggleHidden(hidden)}
              >
                <DownOutlined className="exam-group-chevron" />
                <span className="exam-group-title">
                  {t("infectionControl.exams.timelineGroup")}
                </span>
              </button>
            </Tooltip>
          ) : (
            <span className="exam-group-title">
              {t("infectionControl.exams.timelineGroup")}
            </span>
          )}
          {!hidden && options.length > 0 && (
            <Popover
              content={picker}
              trigger="click"
              placement="bottomRight"
              open={adding}
              onOpenChange={openPicker}
              destroyOnHidden
              arrow={false}
            >
              <Tooltip title={t("infectionControl.exams.timelineAdd")}>
                <Button
                  type="text"
                  size="small"
                  className="exam-group-add"
                  icon={<PlusOutlined />}
                  aria-label={t("infectionControl.exams.timelineAdd")}
                />
              </Tooltip>
            </Popover>
          )}
        </div>
      </RowLabel>
      <Track $days={range.days.length}>{markers}</Track>
    </ExamGroupRow>
  );

  if (hidden) return group;

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

  // while the history loads the timeline shows the courses alone, and so it
  // does when the patient has no exam to plot
  if (status !== "succeeded" || (series.length === 0 && options.length === 0)) {
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
                <Button
                  type="text"
                  size="small"
                  className="exam-remove"
                  icon={<CloseOutlined />}
                  aria-label={t("infectionControl.exams.timelineRemove", {
                    name: item.name,
                  })}
                  onClick={() => onRemove(item.key)}
                />
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
