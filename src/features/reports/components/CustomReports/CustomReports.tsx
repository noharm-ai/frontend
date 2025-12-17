import { Row, Col } from "antd";
import { useEffect, useRef } from "react";

import { useAppSelector, useAppDispatch } from "src/store";
import Empty from "components/Empty";
import { ReportStatusEnum } from "src/models/ReportStatusEnum";
import { selectReport, getCustomReports } from "../../ReportsSlice";
import { DownloadModal } from "./components/DownloadModal/DownloadModal";
import ReportCard from "../ReportCard/ReportCard";

export function CustomReports() {
  const dispatch = useAppDispatch();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const data = useAppSelector((state) => state.reportsArea.reports.config);

  const hasProcessingReports = data.custom.some(
    (report: any) => report.status === ReportStatusEnum.PROCESSING
  );

  // Polling effect
  useEffect(() => {
    if (hasProcessingReports) {
      // Start polling every 5 seconds when there are processing reports
      intervalRef.current = setInterval(() => {
        dispatch(getCustomReports());
      }, 5000);
    } else {
      // Clear interval when no processing reports
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [hasProcessingReports, dispatch]);

  if (data.custom.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Nenhum relatório customizado disponível."
      />
    );
  }

  return (
    <>
      <Row gutter={[20, 20]}>
        {data.custom.map((record: any) => (
          <Col key={record.id} span={24} md={12} lg={8}>
            <ReportCard
              reportData={{
                title: record.name,
                description: record.description,
                type: "custom",
                visible: record.active,
              }}
              showReport={() => dispatch(selectReport(record))}
              id={record.id}
            />
          </Col>
        ))}
      </Row>
      <DownloadModal />
    </>
  );
}
