import React from "react";

import SearchPrescription from "components/Layout/SearchPrescription";
import { PageHeader } from "styles/PageHeader.style";
import { PageCard } from "styles/Utils.style";

function SummarySearch() {
  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">Sumário de Alta</h1>
          <div className="page-header-legend">Buscar pacientes.</div>
        </div>
      </PageHeader>
      <PageCard style={{ maxWidth: "50vw", margin: "0 auto" }}>
        <SearchPrescription type={"summary"} size="big" />
      </PageCard>
    </>
  );
}

export default SummarySearch;
