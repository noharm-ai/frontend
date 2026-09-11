import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import moment from "moment";

import Button from "components/Button";
import DefaultModal from "components/Modal";
import CultureReport from "features/reports/CultureReport/CultureReport";
import { isPrediction } from "features/culture/cultureResistance";
import { trackReport, TrackedReport } from "src/utils/tracker";

import { LastRelease } from "./CultureCardFooter.style";

// the newest release across every culture of the patient. A pending collection
// may carry a release date of its own, but it has no result yet: what this
// states is how recent the newest antibiogram is, so only released results
// count
const lastReleaseDate = (cultures) => {
  let last = null;

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

export function CultureCardFooter({ cultures, prescription }) {
  const { t } = useTranslation();
  const [reportOpen, setReportOpen] = useState(false);

  const lastRelease = lastReleaseDate(cultures);

  const openReport = () => {
    setReportOpen(true);
    trackReport(TrackedReport.CULTURES);
  };

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
      <div className="action">
        <Button type="link" onClick={openReport}>
          Ver todos
        </Button>
      </div>

      <DefaultModal
        title={null}
        destroyOnHidden
        open={reportOpen}
        onCancel={() => setReportOpen(false)}
        width="min(1440px, 100%)"
        footer={null}
        style={{ top: "10px", height: "100vh" }}
      >
        <CultureReport
          idPatient={prescription?.idPatient}
          prescription={prescription}
        />
      </DefaultModal>
    </>
  );
}
