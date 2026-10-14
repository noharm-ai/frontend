import { useTranslation } from "react-i18next";
import moment from "moment";

import { isPrediction } from "features/culture/cultureResistance";
import type { ICultureDrug } from "features/culture/cultureTypes";
import { CultureReportButton } from "features/culture/CultureReportButton/CultureReportButton";

import { LastRelease } from "./CultureCardFooter.style";

interface ICultureCardFooterProps {
  cultures?: ICultureDrug[] | null;
  // the prescription being screened (store/ducks/prescriptions), untyped
  prescription?: any;
  // a card that offers the full report elsewhere (the infection control
  // cultures, in its header) keeps the footer to the last release
  withReport?: boolean;
}

// the newest release across every culture of the patient. A pending collection
// may carry a release date of its own, but it has no result yet: what this
// states is how recent the newest antibiogram is, so only released results
// count
const lastReleaseDate = (cultures?: ICultureDrug[] | null): string | null => {
  let last: string | null = null;

  (cultures ?? []).forEach((drug) =>
    drug.items.forEach((item) => {
      if (isPrediction(item)) {
        return;
      }

      if (item.releaseDate && (!last || item.releaseDate > last)) {
        last = item.releaseDate;
      }
    }),
  );

  return last;
};

export function CultureCardFooter({
  cultures,
  prescription,
  withReport = true,
}: ICultureCardFooterProps) {
  const { t } = useTranslation();

  const lastRelease = lastReleaseDate(cultures);

  return (
    <>
      <div className="stats">
        {lastRelease && (
          <LastRelease className="culture-last-release">
            {t("culture.lastRelease", {
              date: moment(lastRelease).format("DD/MM/YY HH:mm"),
            })}
          </LastRelease>
        )}
      </div>
      {withReport && (
        <div className="action">
          <CultureReportButton prescription={prescription} />
        </div>
      )}
    </>
  );
}
