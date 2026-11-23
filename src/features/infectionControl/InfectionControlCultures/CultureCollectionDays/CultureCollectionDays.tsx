import { Fragment } from "react";
import { useTranslation } from "react-i18next";

import { formatDate } from "utils/date";

import { ICultureCollection } from "../../InfectionControlSlice";
import { CultureCollectionRow } from "../CultureCollectionRow/CultureCollectionRow";

interface CultureCollectionDaysProps {
  // newest first
  collections: ICultureCollection[];
  // the drugs of the prescription, by drugKey: empty without the cultures by
  // drug
  prescribed: Set<string>;
  // without it (the printed report) the rows don't open
  onOpen?: (collection: ICultureCollection) => void;
}

/**
 * The collections under the day they were collected, each a row: what the
 * culture card lists, and the report prints the same way. The list around it
 * (CultureCollectionList) lays them out
 */
export function CultureCollectionDays({
  collections,
  prescribed,
  onOpen,
}: CultureCollectionDaysProps) {
  const { t } = useTranslation();

  return collections.map((collection, index) => {
    const day = formatDate(collection.collectionDate);
    // a day opens with its first collection
    const isFirstOfDay =
      index === 0 || day !== formatDate(collections[index - 1].collectionDate);
    const dayHeader = isFirstOfDay ? (
      <div className="collections-day" data-testid="collection-day">
        {day
          ? t("infectionControl.cultures.collections.collectedOn", {
              date: day,
            })
          : t("infectionControl.cultures.collections.noCollectionDate")}
      </div>
    ) : null;

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
  });
}
