import React, { useEffect } from "react";
import styled from "styled-components";
import isEmpty from "lodash.isempty";
import { useNavigate } from "react-router-dom";

import LoadBox from "components/LoadBox";
import { Row } from "components/Grid";
import CultureReport from "features/reports/CultureReport/CultureReport";
import AntimicrobialHistoryReport from "features/reports/AntimicrobialHistoryReport/AntimicrobialHistoryReport";
import PrescriptionHistoryReport from "features/reports/PrescriptionHistoryReport/PrescriptionHistoryReport";

const DashboardContainer = styled("div")`
  width: 100%;
`;

export default function Reports({ report, prescription }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (isEmpty(report)) {
      navigate("/relatorios");
    }
  }, [report, navigate]);

  if (isEmpty(report)) {
    return <LoadBox />;
  }

  if (report.type === "CULTURE") {
    return (
      <CultureReport
        idPatient={prescription.idPatient}
        prescription={prescription}
      />
    );
  }

  if (report.type === "ANTIMICROBIAL_HISTORY") {
    return <AntimicrobialHistoryReport prescription={prescription} />;
  }

  if (report.type === "PRESCRIPTION_HISTORY") {
    return <PrescriptionHistoryReport prescription={prescription} />;
  }

  return (
    <Row type="flex" gutter={[20, 20]}>
      <DashboardContainer>
        <iframe
          title="Relatório"
          allowFullScreen
          width="100%"
          height={report.height}
          className="dashboard-iframe"
          frameBorder="0"
          src={report.link}
          style={{ border: 0 }}
        ></iframe>
      </DashboardContainer>
    </Row>
  );
}
