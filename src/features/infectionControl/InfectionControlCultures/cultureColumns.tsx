import type { TFunction } from "i18next";
import type { ColumnsType } from "antd/es/table";

import { formatDateTime } from "utils/date";

import { IRecentCulture } from "../InfectionControlSlice";
import { Gram } from "./InfectionControlCultures.style";
import { LabResult } from "./LabResult/LabResult";

/**
 * The columns of the collections of one exam and material (the history). It
 * states its exam and material once, in its title, so there is no column for
 * them. The gram and the lab's result are cut at two lines: a collection
 * opens its antibiogram, where they are shown whole
 */
export const cultureColumns = (t: TFunction): ColumnsType<IRecentCulture> => [
  {
    title: t("infectionControl.cultures.collectionDate"),
    key: "collectionDate",
    className: "culture-date",
    render: (_, culture) => formatDateTime(culture.collectionDate) ?? "-",
  },
  {
    title: t("infectionControl.cultures.releaseDate"),
    key: "releaseDate",
    className: "culture-date",
    render: (_, culture) => formatDateTime(culture.releaseDate) ?? "-",
  },
  {
    title: t("infectionControl.cultures.gram"),
    key: "gram",
    render: (_, culture) =>
      culture.gram ? (
        <Gram className="clamp" data-testid="culture-gram" title={culture.gram}>
          {culture.gram}
        </Gram>
      ) : (
        <span className="muted">-</span>
      ),
  },
  {
    title: t("infectionControl.cultures.microorganism"),
    key: "microorganisms",
    render: (_, culture) =>
      culture.microorganisms.length ? (
        culture.microorganisms.map((name) => (
          <div key={name} className="culture-microorganism">
            {name}
          </div>
        ))
      ) : (
        <span className="muted">-</span>
      ),
  },
  {
    title: t("infectionControl.cultures.result"),
    key: "result",
    render: (_, culture) => (
      <div className="clamp">
        <LabResult value={culture.previousResult} />
      </div>
    ),
  },
];
