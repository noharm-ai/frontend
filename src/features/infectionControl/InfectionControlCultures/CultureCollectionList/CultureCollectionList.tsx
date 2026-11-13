import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { Empty, Spin, Tag } from "antd";

import { formatDate } from "utils/date";

import { ICultureCollection } from "../../InfectionControlSlice";
import { CollectionFilter, filterCollections } from "../cultureCollections";
import { CultureCollectionRow } from "../CultureCollectionRow/CultureCollectionRow";
import { CollectionList } from "./CultureCollectionList.style";

interface CultureCollectionListProps {
  collections: ICultureCollection[];
  loading: boolean;
  // the drugs of the prescription, by drugKey: empty without the cultures by
  // drug, and then the list can't tell a resistance in use
  prescribed: Set<string>;
  filter: CollectionFilter;
  onFilterChange: (filter: CollectionFilter) => void;
  onOpen: (collection: ICultureCollection) => void;
}

/**
 * The collections of the patient, newest first, under the day they were
 * collected. The filters narrow them to the ones that found a microorganism,
 * or to the ones resistant to a drug of the prescription
 */
export function CultureCollectionList({
  collections,
  loading,
  prescribed,
  filter,
  onFilterChange,
  onOpen,
}: CultureCollectionListProps) {
  const { t } = useTranslation();

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

  const filters: CollectionFilter[] = [
    "all",
    "isolated",
    // only the cultures by drug tell the drugs of the prescription
    ...(prescribed.size > 0 ? (["resistantInUse"] as const) : []),
  ];
  const visible = filterCollections(collections, filter, prescribed);

  let lastDay: string | null | undefined;

  return (
    <CollectionList>
      <div className="collections-toolbar">
        <span className="legend">
          {t("infectionControl.cultures.collections.legend")}
        </span>
        <div
          className="collections-filters"
          role="group"
          aria-label={t("infectionControl.cultures.collections.filter")}
        >
          {filters.map((key) => (
            <Tag.CheckableTag
              key={key}
              checked={filter === key}
              onChange={() => onFilterChange(key)}
              data-testid={`collection-filter-${key}`}
            >
              {t(`infectionControl.cultures.collections.filters.${key}`)} (
              {filterCollections(collections, key, prescribed).length})
            </Tag.CheckableTag>
          ))}
        </div>
      </div>

      {visible.length ? (
        visible.map((collection) => {
          const day = formatDate(collection.collectionDate);
          const dayHeader =
            day !== lastDay ? (
              <div className="collections-day">
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
