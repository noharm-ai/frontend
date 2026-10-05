import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { Button, Slider, Tag, Tooltip } from "antd";
import { EyeInvisibleOutlined } from "@ant-design/icons";

import { DatePicker } from "components/Inputs";
import { TIME_SLIDER_STEP } from "components/Prioritization/Util";
import { PrescriptionDatesFilterContainer } from "./PrescriptionDatesFilter.style";

// filters agg prescriptions by their inner (individual) prescription dates:
// the user picks a day and, on the slider, the point in time they are looking
// from. value: { datetime: iso } — an empty date means no filtering.
// hiddenCount: how many records the current pointer leaves out of the list.
const MINUTES_IN_DAY = 24 * 60;
const SLIDER_MAX = MINUTES_IN_DAY - TIME_SLIDER_STEP;
// beyond this distance from the machine clock the picker is flagged, so a
// time-traveled list is never mistaken for the current one
const DEVIATION_TOLERANCE_MS = 60 * 60 * 1000;

const formatMinutes = (minutes) => {
  const hour = `${Math.floor(minutes / 60)}`.padStart(2, "0");
  const minute = `${minutes % 60}`.padStart(2, "0");

  return `${hour}:${minute}`;
};

export function PrescriptionDatesFilter({
  value,
  onChange,
  hiddenCount,
  style,
  className,
}) {
  const { t } = useTranslation();
  const [dragMinutes, setDragMinutes] = useState(null);
  const datetime = value?.datetime ? dayjs(value.datetime) : null;
  const minutes =
    dragMinutes ?? (datetime ? datetime.hour() * 60 + datetime.minute() : 0);
  const deviated =
    datetime && Math.abs(datetime.diff(dayjs())) > DEVIATION_TOLERANCE_MS;

  const emit = (date, timeInMinutes) => {
    onChange({
      datetime: date.startOf("day").add(timeInMinutes, "minute").toISOString(),
    });
  };

  const onDateChange = (date) => {
    if (!date) {
      setDragMinutes(null);
      onChange(null);
      return;
    }

    if (datetime) {
      emit(date, minutes);
      return;
    }

    // first pick: start from now on the current day, midnight on any other
    const now = dayjs();
    const isToday = date.isSame(now, "day");
    emit(
      date,
      isToday
        ? Math.floor((now.hour() * 60 + now.minute()) / TIME_SLIDER_STEP) *
            TIME_SLIDER_STEP
        : 0,
    );
  };

  const onTimeChangeComplete = (timeInMinutes) => {
    setDragMinutes(null);

    if (datetime) {
      emit(datetime, timeInMinutes);
    }
  };

  return (
    <PrescriptionDatesFilterContainer
      className={className}
      style={style}
      data-kb="prioritization.prescriptionDates"
    >
      {/* the pointer is also a filter: say so, rather than a neutral "from" */}
      {datetime && (
        <Tooltip title={t("screeningList.prescriptionDatesHint")}>
          <div className="prescription-dates-label">
            {t("screeningList.prescriptionDatesHideBefore")}
          </div>
        </Tooltip>
      )}
      <DatePicker
        format="DD/MM/YYYY"
        allowClear
        status={deviated ? "warning" : undefined}
        style={{ width: 140 }}
        placeholder={t("screeningList.prescriptionDatesPlaceholder")}
        value={datetime}
        onChange={onDateChange}
      />
      {datetime && (
        <>
          <Slider
            min={0}
            max={SLIDER_MAX}
            step={TIME_SLIDER_STEP}
            value={minutes}
            tooltip={{
              formatter: (value) =>
                t("screeningList.prescriptionDatesSliderTooltip", {
                  time: formatMinutes(value),
                }),
            }}
            onChange={setDragMinutes}
            onChangeComplete={onTimeChangeComplete}
          />
          <div className="prescription-dates-time">
            {formatMinutes(minutes)}
          </div>
          {hiddenCount > 0 && (
            <Tooltip title={t("screeningList.prescriptionDatesHiddenHint")}>
              <Tag
                className="prescription-dates-hidden"
                color="orange"
                icon={<EyeInvisibleOutlined />}
              >
                {t("screeningList.prescriptionDatesHidden", {
                  count: hiddenCount,
                })}
              </Tag>
            </Tooltip>
          )}
          <Button
            type="link"
            className="prescription-dates-show-all"
            onClick={() => onDateChange(null)}
          >
            {t("screeningList.prescriptionDatesShowAll")}
          </Button>
        </>
      )}
    </PrescriptionDatesFilterContainer>
  );
}
