import React from "react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

import { Select, RangeDatePicker } from "components/Inputs";
import { PRESCRIPTION_DATES_FILTER } from "components/Prioritization/Util";

// filters agg prescriptions by their inner (individual) prescription dates.
// value: { mode: "all" | "next" | "range", range: [isoStart, isoEnd] }
// "next" uses the user's machine clock, "range" a user-chosen interval
export function PrescriptionDatesFilter({ value, onChange, style }) {
  const { t } = useTranslation();
  const mode = value?.mode || PRESCRIPTION_DATES_FILTER.ALL;
  const range = value?.range || [null, null];

  const onModeChange = (newMode) => {
    onChange({
      mode: newMode || PRESCRIPTION_DATES_FILTER.ALL,
      range: newMode === PRESCRIPTION_DATES_FILTER.RANGE ? range : [null, null],
    });
  };

  const onRangeChange = (dates) => {
    onChange({
      mode: PRESCRIPTION_DATES_FILTER.RANGE,
      range: [
        dates?.[0] ? dates[0].toISOString() : null,
        dates?.[1] ? dates[1].toISOString() : null,
      ],
    });
  };

  return (
    <div style={{ display: "flex", gap: 8, ...style }}>
      <Select
        className={mode !== PRESCRIPTION_DATES_FILTER.ALL ? "warning" : null}
        style={{ width: 220 }}
        value={mode}
        onChange={onModeChange}
        optionFilterProp="children"
      >
        <Select.Option value={PRESCRIPTION_DATES_FILTER.ALL}>
          {t("screeningList.prescriptionDatesAll")}
        </Select.Option>
        <Select.Option value={PRESCRIPTION_DATES_FILTER.NEXT}>
          {t("screeningList.prescriptionDatesNext")}
        </Select.Option>
        <Select.Option value={PRESCRIPTION_DATES_FILTER.RANGE}>
          {t("screeningList.prescriptionDatesRange")}
        </Select.Option>
      </Select>
      {mode === PRESCRIPTION_DATES_FILTER.RANGE && (
        <RangeDatePicker
          format="DD/MM/YYYY HH:mm"
          showTime={{ format: "HH:mm" }}
          allowEmpty={[true, true]}
          value={[
            range[0] ? dayjs(range[0]) : null,
            range[1] ? dayjs(range[1]) : null,
          ]}
          onChange={onRangeChange}
        />
      )}
    </div>
  );
}
