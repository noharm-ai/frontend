import {
  CSSProperties,
  Fragment,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { Empty, Spin } from "antd";

import { formatDate } from "utils/date";

import { ICultureCollection } from "../../InfectionControlSlice";
import {
  CollectionDetail,
  filterCollections,
  ICollectionDetails,
  IDetailOption,
} from "../cultureCollections";
import { CollectionDetailsFilter } from "../CollectionDetailsFilter/CollectionDetailsFilter";
import { CultureCollectionRow } from "../CultureCollectionRow/CultureCollectionRow";
import { CollectionList } from "./CultureCollectionList.style";

interface CultureCollectionListProps {
  collections: ICultureCollection[];
  loading: boolean;
  // the drugs of the prescription, by drugKey: empty without the cultures by
  // drug, and then the list can't tell a resistance in use
  prescribed: Set<string>;
  // the filters (exam, material, microorganism) and their options
  details: ICollectionDetails;
  detailOptions: Record<CollectionDetail, IDetailOption[]>;
  onDetailsChange: (details: ICollectionDetails) => void;
  onOpen: (collection: ICultureCollection) => void;
}

/**
 * The collections of the patient, newest first, under the day they were
 * collected, the day of the ones in sight held under the toolbar as the card
 * scrolls. The filters, a button away, narrow them to an exam, material or
 * microorganism
 */
export function CultureCollectionList({
  collections,
  loading,
  prescribed,
  details,
  detailOptions,
  onDetailsChange,
  onOpen,
}: CultureCollectionListProps) {
  const { t } = useTranslation();
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [toolbarHeight, setToolbarHeight] = useState(0);

  // the day rows stick right under the toolbar, which wraps on a narrow card
  const hasList = !loading && collections.length > 0;
  useLayoutEffect(() => {
    const toolbar = toolbarRef.current;
    if (!toolbar) return;

    const measure = () => setToolbarHeight(toolbar.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(toolbar);

    return () => observer.disconnect();
  }, [hasList]);

  if (loading) {
    return (
      <div className="cultures-loading">
        <Spin />
      </div>
    );
  }

  if (!collections.length) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={t("infectionControl.cultures.empty")}
      />
    );
  }

  const visible = filterCollections(collections, details);

  let lastDay: string | null | undefined;

  return (
    <CollectionList
      style={{ "--toolbar-height": `${toolbarHeight}px` } as CSSProperties}
    >
      <div className="collections-toolbar" ref={toolbarRef}>
        <span className="legend">
          {t("infectionControl.cultures.collections.legend")}
        </span>
        <CollectionDetailsFilter
          options={detailOptions}
          details={details}
          onChange={onDetailsChange}
        />
      </div>

      {visible.length ? (
        visible.map((collection) => {
          const day = formatDate(collection.collectionDate);
          const dayHeader =
            day !== lastDay ? (
              <div className="collections-day" data-testid="collection-day">
                {day
                  ? t("infectionControl.cultures.collections.collectedOn", {
                      date: day,
                    })
                  : t("infectionControl.cultures.collections.noCollectionDate")}
              </div>
            ) : null;
          lastDay = day;

          return (
            <Fragment key={collection.id}>
              {dayHeader}
              <CultureCollectionRow
                collection={collection}
                prescribed={prescribed}
                onOpen={onOpen}
              />
            </Fragment>
          );
        })
      ) : (
        <div className="collections-empty">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t("infectionControl.cultures.collections.emptyFilter")}
          />
        </div>
      )}
    </CollectionList>
  );
}
