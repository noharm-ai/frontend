import React from "react";
import { useTranslation } from "react-i18next";

import SearchPrescription from "components/Layout/SearchPrescription";
import { PageHeader } from "styles/PageHeader.style";
import { PageCard } from "styles/Utils.style";

function SummarySearch() {
  const { t } = useTranslation();

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">{t("summary.title")}</h1>
          <div className="page-header-legend">{t("summary.searchLegend")}</div>
        </div>
      </PageHeader>
      <PageCard style={{ maxWidth: "50vw", margin: "0 auto" }}>
        <SearchPrescription type={"summary"} size="big" />
      </PageCard>
    </>
  );
}

export default SummarySearch;
