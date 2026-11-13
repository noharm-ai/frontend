import { CSSProperties, ReactNode, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Tooltip } from "antd";
import dayjs from "dayjs";

import { formatDateTime } from "utils/date";

import { ICultureCollection } from "../../InfectionControlSlice";
import {
  hasIsolate,
  organismsOf,
} from "../../InfectionControlCultures/cultureCollections";
import { ITimelineRange, toPercent } from "../../timeline";
import { DAY_WIDTH, RowLabel, Track } from "../CourseGantt.style";
import { CULTURE_LANE, CultureMark, CultureRowBox } from "./CultureRow.style";

// marks closer than this (in pixels) go to a line of their own
const MIN_GAP = 16;

interface CultureRowProps {
  // the collections with a collection date within the timeline
  collections: ICultureCollection[];
  range: ITimelineRange;
  // the lines of today and the discharge, across the row
  markers: ReactNode;
  onOpen: (collection: ICultureCollection) => void;
}

/**
 * The culture collections of the patient on the timeline, a mark on the
 * moment each was collected, beside the courses it may explain: red when it
 * found a microorganism. A mark opens the collection whole (the drawer of the
 * culture card)
 */
export function CultureRow({
  collections,
  range,
  markers,
  onOpen,
}: CultureRowProps) {
  const { t } = useTranslation();

  // collections close in time stack, one line each
  const { marks, lanes } = useMemo(() => {
    const width = range.days.length * DAY_WIDTH;
    const laneEnds: number[] = [];
    const sorted = [...collections].sort(
      (a, b) =>
        dayjs(a.collectionDate).valueOf() - dayjs(b.collectionDate).valueOf(),
    );
    const placed = sorted.map((collection) => {
      const percent = toPercent(collection.collectionDate!, range);
      const x = (percent / 100) * width;
      let lane = laneEnds.findIndex((end) => x - end >= MIN_GAP);
      if (lane === -1) {
        lane = laneEnds.length;
        laneEnds.push(x);
      } else {
        laneEnds[lane] = x;
      }

      return { collection, percent, lane };
    });

    return { marks: placed, lanes: Math.max(1, laneEnds.length) };
  }, [collections, range]);

  return (
    <CultureRowBox
      data-testid="timeline-cultures"
      data-kb="infectionControl.antimicrobials.cultures"
      style={{ "--culture-lanes": lanes } as CSSProperties}
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
        {marks.map(({ collection, percent, lane }) => {
          const isolated = hasIsolate(collection);
          const organisms = organismsOf(collection)
            .map((organism) => organism.microorganism)
            .filter((name): name is string => !!name);

          return (
            <Tooltip
              key={collection.id}
              title={
                <>
                  <strong>{collection.examName ?? "-"}</strong>
                  {collection.material && <div>{collection.material}</div>}
                  <div>
                    {t("infectionControl.cultures.collections.collectedOn", {
                      date: formatDateTime(collection.collectionDate),
                    })}
                  </div>
                  <div>
                    {organisms.length
                      ? organisms.join(", ")
                      : t("infectionControl.cultures.collections.notIsolated")}
                  </div>
                </>
              }
            >
              <CultureMark
                type="button"
                className={isolated ? "isolated" : undefined}
                data-testid="timeline-culture"
                aria-label={t("infectionControl.timeline.cultureOpen", {
                  exam: collection.examName ?? "-",
                  date: formatDateTime(collection.collectionDate),
                })}
                style={{
                  left: `${percent}%`,
                  top: `calc(50% + ${(lane - (lanes - 1) / 2) * CULTURE_LANE}px)`,
                }}
                onClick={() => onOpen(collection)}
              />
            </Tooltip>
          );
        })}
        {markers}
      </Track>
    </CultureRowBox>
  );
}
