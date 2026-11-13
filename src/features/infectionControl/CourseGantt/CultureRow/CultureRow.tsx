import { ReactNode, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Popover } from "antd";
import { RightOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import { formatDate, formatDateTime } from "utils/date";

import { ICultureCollection } from "../../InfectionControlSlice";
import {
  hasIsolate,
  organismsOf,
} from "../../InfectionControlCultures/cultureCollections";
import { ITimelineRange, toPercent } from "../../timeline";
import { RowLabel, Track } from "../CourseGantt.style";
import { CultureDay, CultureMark, CultureRowBox } from "./CultureRow.style";

interface CultureRowProps {
  // the collections with a collection date within the timeline
  collections: ICultureCollection[];
  range: ITimelineRange;
  // the lines of today and the discharge, across the row
  markers: ReactNode;
  onOpen: (collection: ICultureCollection) => void;
}

interface ICultureDay {
  day: dayjs.Dayjs;
  // in the order they were collected
  collections: ICultureCollection[];
}

const organismNames = (collection: ICultureCollection) =>
  organismsOf(collection)
    .map((organism) => organism.microorganism)
    .filter((name): name is string => !!name);

/**
 * The collections of one day, a single mark on the day whatever their number:
 * a red ring when any found a microorganism, with their count when more than
 * one. Hovering it lists them, each opening in the drawer; a click opens a
 * lone collection straight away, and keeps the list of several open
 */
function DayMark({
  cultureDay,
  range,
  onOpen,
}: {
  cultureDay: ICultureDay;
  range: ITimelineRange;
  onOpen: (collection: ICultureCollection) => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const { day, collections } = cultureDay;
  const count = collections.length;
  const isolated = collections.some(hasIsolate);
  const date = day.format("DD/MM/YYYY");
  const left = `${toPercent(day.add(12, "hour"), range)}%`;

  const openCollection = (collection: ICultureCollection) => {
    setOpen(false);
    onOpen(collection);
  };

  const content = (
    <CultureDay data-testid="timeline-culture-day">
      <header>
        <strong>{day.format("DD/MM/YYYY")}</strong>
        <span>{t("infectionControl.timeline.culturesCount", { count })}</span>
      </header>
      <ul>
        {collections.map((collection) => {
          const organisms = organismNames(collection);

          return (
            <li key={collection.id}>
              <button type="button" onClick={() => openCollection(collection)}>
                <span className="day-time">
                  {formatDate(collection.collectionDate, "HH:mm")}
                </span>
                <span className="day-body">
                  <span className="day-exam">{collection.examName ?? "-"}</span>
                  {collection.material && (
                    <span className="day-material">{collection.material}</span>
                  )}
                  <span
                    className={`day-result${organisms.length ? " isolated" : ""}`}
                  >
                    {organisms.length
                      ? organisms.join(", ")
                      : t("infectionControl.cultures.collections.notIsolated")}
                  </span>
                </span>
                <RightOutlined className="day-open" />
              </button>
            </li>
          );
        })}
      </ul>
    </CultureDay>
  );

  return (
    <Popover
      content={content}
      open={open}
      onOpenChange={setOpen}
      // not on focus: picking a line moves the focus out of the mark, which
      // would close the list under the click (Enter on the mark opens it)
      trigger="hover"
      mouseEnterDelay={0.15}
      mouseLeaveDelay={0.2}
      placement="top"
      styles={{ container: { padding: 0 } }}
    >
      <CultureMark
        type="button"
        className={[
          isolated ? "isolated" : "",
          count > 1 ? "several" : "",
        ].join(" ")}
        data-testid="timeline-culture"
        aria-label={
          count > 1
            ? t("infectionControl.timeline.cultureDay", { count, date })
            : t("infectionControl.timeline.cultureOpen", {
                exam: collections[0].examName ?? "-",
                date: formatDateTime(collections[0].collectionDate),
              })
        }
        style={{ left }}
        onClick={() =>
          count > 1 ? setOpen(true) : openCollection(collections[0])
        }
      >
        {count > 1 ? count : null}
      </CultureMark>
    </Popover>
  );
}

/**
 * The culture collections of the patient on the timeline, a mark on each day
 * of collection, beside the courses they may explain: a red ring when one
 * found a microorganism, with the count when the day had several. A mark
 * lists them, and each opens whole (the drawer of the culture card)
 */
export function CultureRow({
  collections,
  range,
  markers,
  onOpen,
}: CultureRowProps) {
  const { t } = useTranslation();

  const days = useMemo(() => {
    const byDay = new Map<string, ICultureDay>();
    [...collections]
      .sort(
        (a, b) =>
          dayjs(a.collectionDate).valueOf() - dayjs(b.collectionDate).valueOf(),
      )
      .forEach((collection) => {
        const day = dayjs(collection.collectionDate).startOf("day");
        const key = day.format("YYYY-MM-DD");
        if (!byDay.has(key)) byDay.set(key, { day, collections: [] });
        byDay.get(key)!.collections.push(collection);
      });

    return [...byDay.values()];
  }, [collections]);

  return (
    <CultureRowBox
      data-testid="timeline-cultures"
      data-kb="infectionControl.antimicrobials.cultures"
    >
      <RowLabel>
        <span className="culture-row-title">
          {t("infectionControl.timeline.cultures")}
        </span>
        <span className="culture-row-count">
          {t("infectionControl.timeline.culturesCount", {
            count: collections.length,
          })}
        </span>
      </RowLabel>
      <Track $days={range.days.length}>
        {days.map((cultureDay) => (
          <DayMark
            key={cultureDay.day.valueOf()}
            cultureDay={cultureDay}
            range={range}
            onOpen={onOpen}
          />
        ))}
        {markers}
      </Track>
    </CultureRowBox>
  );
}
