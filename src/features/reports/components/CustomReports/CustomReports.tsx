import { Avatar, TableProps, Tag } from "antd";
import {
  SearchOutlined,
  BarChartOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { useEffect, useRef } from "react";

import { useAppSelector, useAppDispatch } from "src/store";
import Tooltip from "components/Tooltip";
import Button from "components/Button";
import Empty from "components/Empty";
import { CardTable } from "components/Table";
import { formatDateTime } from "src/utils/date";
import { ReportStatusEnum } from "src/models/ReportStatusEnum";
import { selectReport, getCustomReports } from "../../ReportsSlice";
import { DownloadModal } from "./components/DownloadModal/DownloadModal";

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

  const columns: TableProps["columns"] = [
    {
      title: "",
      align: "center",
      width: 60,
      render: () => (
        <Avatar
          icon={<BarChartOutlined />}
          style={{ backgroundColor: "#a991d6", color: "#fff" }}
        />
      ),
    },
    {
      title: "Nome",
      dataIndex: "name",
    },
    {
      title: "Descrição",
      dataIndex: "description",
    },
    {
      title: "Último processamento",
      align: "center",
      render: (record: any) => {
        return formatDateTime(record.processed_at);
      },
    },
    {
      title: "Situação",
      align: "center",
      render: (record: any) => {
        const statusConfig = ReportStatusEnum.getConfig(record.status);

        if (record.status === ReportStatusEnum.PROCESSING) {
          return (
            <Tag
              color={statusConfig.color}
              style={{ margin: 0 }}
              icon={<SyncOutlined spin={true} />}
            >
              {statusConfig.name}
            </Tag>
          );
        }

        if (!record.active) {
          return (
            <Tooltip title="Este relatório não está disponível para os usuários. Acesse a curadoria de relatórios para ativá-lo.">
              <Tag style={{ margin: 0 }}>Inativo</Tag>
            </Tooltip>
          );
        }

        return (
          <Tag color={statusConfig.color} style={{ margin: 0 }}>
            {statusConfig.name}
          </Tag>
        );
      },
    },
    {
      title: "Ações",
      key: "actions",
      align: "center",
      width: 100,
      render: (record: any) => (
        <Tooltip title="Visualizar">
          <Button
            icon={<SearchOutlined />}
            type="primary"
            onClick={() => dispatch(selectReport(record))}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <>
      <CardTable<any>
        columns={columns}
        dataSource={data.custom}
        rowKey="id"
        pagination={false}
        size="small"
      />
      <DownloadModal />
    </>
  );
}
