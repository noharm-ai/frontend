import React, { useState } from "react";
import { PieChartOutlined } from "@ant-design/icons";

import Tooltip from "components/Tooltip";
import ViewReport from "components/Reports/ViewReport";
import DefaultModal from "components/Modal";
import PermissionService from "services/PermissionService";
import Permission from "models/Permission";
import { trackReport, TrackedReport } from "src/utils/tracker";

export default function ReportsTab({ prescription }) {
  const [currentReport, setCurrentReport] = useState(null);

  const { admissionReports, admissionReportsInternal } = prescription;

  const reportClick = (report) => {
    setCurrentReport({
      ...report,
      link: report.link
        .replaceAll("#nratendimento#", prescription.admissionNumber)
        .replaceAll("#fkpessoa#", prescription.idPatient),
    });

    trackReport(TrackedReport.CUSTOM, {
      title: report.description,
    });
  };

  const internalReports = [
    {
      title: "Culturas",
      description: "Relatório de Culturas",
      type: "CULTURE",
      track: TrackedReport.CULTURES,
      visible:
        admissionReportsInternal &&
        admissionReportsInternal.indexOf("CULTURE") !== -1,
    },
    {
      title: "Histórico de Antimicrobianos",
      description: "Histórico de uso de antimicrobianos",
      type: "ANTIMICROBIAL_HISTORY",
      track: TrackedReport.ANTIMICROBIAL_HISTORY,
      visible:
        admissionReportsInternal &&
        admissionReportsInternal.indexOf("ANTIMICROBIAL_HISTORY") !== -1,
    },
    {
      title: "Histórico de Eventos",
      description:
        "Histórico de eventos relacionados à prescrição (Ex.: checagens e revisões).",
      type: "PRESCRIPTION_HISTORY",
      track: TrackedReport.PRESCRIPTION_EVENT_HISTORY,
      visible: true,
    },
    {
      title: "Busca de Exames",
      description: "Pesquisa por exames, inclusive ainda não configurados.",
      type: "EXAMS_SEARCH",
      visible: PermissionService().has(Permission.MAINTAINER),
    },
  ];

  const open = (type, track) => {
    setCurrentReport({
      title: null,
      type,
    });
    if (track) {
      trackReport(track);
    }
  };

  return (
    <div className="patient-data">
      <div className="patient-data-item full">
        <div className="patient-data-item-value">
          <ul className="report-list">
            {internalReports
              .filter((r) => r.visible)
              .map((r) => (
                <Tooltip title={r.description} key={r.description}>
                  <li onClick={() => open(r.type, r.track)}>
                    <PieChartOutlined style={{ fontSize: "18px" }} /> {r.title}
                  </li>
                </Tooltip>
              ))}
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
        width={currentReport?.type ? "min(1440px, 100%)" : "90%"}
        footer={null}
        style={{ top: "10px", height: "100vh" }}
      >
        <ViewReport report={currentReport} prescription={prescription} />
      </DefaultModal>
    </div>
  );
}
