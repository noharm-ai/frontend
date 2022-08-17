import React, { useEffect } from "react";
import styled from "styled-components";
import isEmpty from "lodash.isempty";
import { useNavigate } from "react-router-dom";

import LoadBox from "components/LoadBox";
import { Row } from "components/Grid";

const DashboardContainer = styled("div")`
  width: 100%;
`;

export default function Reports({ report }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (isEmpty(report)) {
      navigate("/relatorios");
    }
  }, [report, navigate]);

  if (isEmpty(report)) {
    return <LoadBox />;
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
