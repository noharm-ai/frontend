import type { TFunction } from "i18next";
import type { ColumnsType } from "antd/es/table";

import { formatDateTime } from "utils/date";

import { IRecentCulture } from "../InfectionControlSlice";
import { Gram } from "./InfectionControlCultures.style";
import { LabResult } from "./LabResult/LabResult";

/**
 * The columns of a culture, shared by the recent cultures and the history of
 * one exam and material. The history states its exam and material once, in
 * its title, so it leaves that column out (withExam: false). Beside the
 * cultures by drug the release goes under the collection, which keeps the row
 * narrow enough for the result (stackDates: true)
 */
export const cultureColumns = (
  t: TFunction,
  { withExam, stackDates }: { withExam: boolean; stackDates: boolean },
): ColumnsType<IRecentCulture> => [
  ...(withExam
    ? [
        {
          title: t("infectionControl.cultures.exam"),
          key: "exam",
          render: (_: unknown, culture: IRecentCulture) => (
            <>
              <div className="culture-exam">{culture.examName ?? "-"}</div>
              {culture.material && (
                <div className="culture-material">{culture.material}</div>
              )}
            </>
          ),
        },
      ]
    : []),
  ...(stackDates
    ? [
        {
          title: `${t("infectionControl.cultures.collectionDate")} / ${t("infectionControl.cultures.releaseDate")}`,
          key: "dates",
          className: "culture-date",
          render: (_: unknown, culture: IRecentCulture) => (
            <>
              <div>{formatDateTime(culture.collectionDate) ?? "-"}</div>
              <div className="muted">
                {formatDateTime(culture.releaseDate) ?? "-"}
              </div>
            </>
          ),
        },
      ]
    : [
        {
          title: t("infectionControl.cultures.collectionDate"),
          key: "collectionDate",
          className: "culture-date",
          render: (_: unknown, culture: IRecentCulture) =>
            formatDateTime(culture.collectionDate) ?? "-",
        },
        {
          title: t("infectionControl.cultures.releaseDate"),
          key: "releaseDate",
          className: "culture-date",
          render: (_: unknown, culture: IRecentCulture) =>
            formatDateTime(culture.releaseDate) ?? "-",
        },
      ]),
  {
    title: t("infectionControl.cultures.gram"),
    key: "gram",
    render: (_, culture) =>
      culture.gram ? (
        <Gram data-testid="culture-gram">{culture.gram}</Gram>
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
    render: (_, culture) => <LabResult value={culture.previousResult} />,
  },
];
