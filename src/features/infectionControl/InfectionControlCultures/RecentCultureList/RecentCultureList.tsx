import { useTranslation } from "react-i18next";
import { Empty, Spin } from "antd";

import { formatDateTime } from "utils/date";

import { IRecentCulture } from "../../InfectionControlSlice";
import { LabResult } from "../LabResult/LabResult";
import { CultureList } from "./RecentCultureList.style";

interface RecentCultureListProps {
  cultures: IRecentCulture[];
  loading: boolean;
  onOpen: (culture: IRecentCulture) => void;
}

/**
 * The recent cultures, one block each: the exam, material and dates on top,
 * and under them the microorganisms, the gram and the lab's result across
 * the whole width, each on its line even when the lab has not written it.
 * Labs write the gram and the result as they please, from a word to a
 * paragraph on the method, so they are cut at two lines: the block opens the
 * culture, where they are shown whole
 */
export function RecentCultureList({
  cultures,
  loading,
  onOpen,
}: RecentCultureListProps) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="cultures-loading">
        <Spin />
      </div>
    );
  }

  if (!cultures.length) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={t("infectionControl.cultures.empty")}
      />
    );
  }

  return (
    <CultureList>
      {cultures.map((culture) => (
        <li key={culture.id}>
          <div
            className="recent-culture"
            data-testid="recent-culture"
            role="button"
            tabIndex={0}
            title={t("infectionControl.cultures.openHistory")}
            onClick={() => onOpen(culture)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onOpen(culture);
              }
            }}
          >
            <div className="recent-culture-head">
              <div>
                <div className="culture-exam">{culture.examName ?? "-"}</div>
                {culture.material && (
                  <div className="culture-material">{culture.material}</div>
                )}
              </div>
              <dl className="recent-culture-dates">
                <dt>{t("infectionControl.cultures.collectionDate")}</dt>
                <dd>{formatDateTime(culture.collectionDate) ?? "-"}</dd>
                <dt>{t("infectionControl.cultures.releaseDate")}</dt>
                <dd>{formatDateTime(culture.releaseDate) ?? "-"}</dd>
              </dl>
            </div>

            <dl className="recent-culture-texts">
              <dt>{t("infectionControl.cultures.microorganism")}</dt>
              <dd className="recent-culture-microorganisms">
                {culture.microorganisms.length ? (
                  culture.microorganisms.map((name) => (
                    <span key={name} className="culture-microorganism">
                      {name}
                    </span>
                  ))
                ) : (
                  <span className="muted">-</span>
                )}
              </dd>
              <dt>{t("infectionControl.cultures.gram")}</dt>
              {culture.gram ? (
                <dd
                  className="clamp recent-culture-gram"
                  data-testid="culture-gram"
                  title={culture.gram}
                >
                  {culture.gram}
                </dd>
              ) : (
                <dd className="muted">-</dd>
              )}
              <dt>{t("infectionControl.cultures.result")}</dt>
              <dd className="clamp">
                <LabResult value={culture.previousResult} />
              </dd>
            </dl>
          </div>
        </li>
      ))}
    </CultureList>
  );
}
