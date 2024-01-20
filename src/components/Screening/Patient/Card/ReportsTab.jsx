import React, { useState } from "react";
import { PieChartOutlined } from "@ant-design/icons";

import Tooltip from "components/Tooltip";
import ViewReport from "components/Reports/ViewReport";
import DefaultModal from "components/Modal";

export default function ReportsTab({ prescription }) {
  const [currentReport, setCurrentReport] = useState(null);

  const { admissionReports } = prescription;

  const reportClick = (report) => {
    setCurrentReport({
      ...report,
      link: report.link
        .replaceAll("#nratendimento#", prescription.admissionNumber)
        .replaceAll("#fkpessoa#", prescription.idPatient),
    });
  };

  return (
    <div className="patient-data">
      <div className="patient-data-item full">
        <div className="patient-data-item-value">
          <ul className="report-list">
            {admissionReports &&
              admissionReports.map((r) => (
                <Tooltip title={r.description} key={r.description}>
                  <li onClick={() => reportClick(r)}>
                    <PieChartOutlined style={{ fontSize: "18px" }} /> {r.title}
                  </li>
                </Tooltip>
              ))}
          </ul>
        </div>
      </div>
      <DefaultModal
        title={currentReport?.title}
        destroyOnClose
        open={currentReport != null}
        onCancel={() => setCurrentReport(null)}
        width="90%"
        footer={null}
        style={{ top: "10px", height: "100vh" }}
      >
        <ViewReport report={currentReport} />
      </DefaultModal>
    </div>
  );
}
