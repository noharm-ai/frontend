import { useState } from "react";
import dayjs from "dayjs";
import {
  DownloadOutlined,
  SyncOutlined,
  FileTextOutlined,
  FileExcelOutlined,
  BarChartOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { List, Avatar, MenuProps, Alert } from "antd";
import { useTranslation } from "react-i18next";

import { useAppDispatch, useAppSelector } from "src/store";
import Tooltip from "components/Tooltip";
import Modal from "components/Modal";
import Button from "components/Button";
import Dropdown from "components/Dropdown";
import { formatDateTime } from "utils/date";
import {
  selectReport,
  processReport,
  downloadReport,
  getCustomReports,
} from "src/features/reports/ReportsSlice";
import { ReportStatusEnum } from "src/models/ReportStatusEnum";
import notification from "components/notification";
import { getErrorMessage } from "src/utils/errorHandler";
import { TrackedReport, trackReport } from "src/utils/tracker";
import PermissionService from "src/services/PermissionService";
import Permission from "src/models/Permission";

export function DownloadModal() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const data: any = useAppSelector(
    (state) => state.reportsArea.reports.selectedReport.data,
  );
  const [loading, setLoading] = useState<boolean>(false);
  const isProcessing = data && data.status === ReportStatusEnum.PROCESSING;

  const executeDownloadWithFormat = (
    filename: string,
    format: "csv" | "xlsx",
  ) => {
    setLoading(true);
    trackReport(TrackedReport.CUSTOM, {
      title: `exportar: ${data.name} - ${format}`,
    });

    const formatExtension = format === "csv" ? ".csv" : ".xlsx";
    const formattedFilename = filename.includes(".")
      ? filename.replace(/\.[^/.]+$/, formatExtension)
      : filename + formatExtension;

    const payload = {
      idReport: data.id,
      filename: formattedFilename,
    };

    // @ts-expect-error ts 2554 (legacy code)
    dispatch(downloadReport(payload)).then((response: any) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        if (response.payload.data.data.url) {
          window.open(response.payload.data.data.url);
        }
      }

      setLoading(false);
    });
  };

  const openReportPreview = (filename: string) => {
    trackReport(TrackedReport.CUSTOM, {
      title: `preview: ${data.name}`,
    });
    window.open(
      `/relatorios/arquivo/CUSTOM/${data.id}/${filename.replace(/\.[^/.]+$/, "")}`,
    );
  };

  const executeProcessReport = () => {
    if (
      data.processed_at &&
      !PermissionService().has(Permission.READ_CUSTOM_REPORTS)
    ) {
      const diff = dayjs().diff(dayjs(data.processed_at), "hours");

      if (diff < 1) {
        Modal.warning({
          title: "Processamento recente",
          content:
            "Este relatório foi processado há menos de uma hora. Você deve esperar pelo menos uma hora antes de processá-lo novamente.",
          okText: "Ok",
        });
        return;
      }
    }

    setLoading(true);

    // @ts-expect-error ts 2554 (legacy code)
    dispatch(processReport({ idReport: data.id })).then((response: any) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        dispatch(getCustomReports());
      }

      setLoading(false);
    });
  };

  const renderItems = (item: any, index: number) => {
    const actions = [];
    let diff = 0;
    let title = dayjs(item.name).format("DD/MM/YYYY");

    if (item.updateAt) {
      diff = dayjs().diff(dayjs(item.updateAt), "minutes");

      if (diff < 2) {
        title = `${dayjs(item.name).format("DD/MM/YYYY")} - Atualizado`;
      }
    }

    if (index === 0) {
      actions.push(
        <Button
          onClick={() => executeProcessReport()}
          icon={<SyncOutlined spin={isProcessing} />}
          type={item.ready ? "default" : "primary"}
          disabled={isProcessing || loading}
        >
          {isProcessing
            ? "Processando"
            : item.ready
              ? "Reprocessar"
              : "Processar"}
        </Button>,
      );
    }

    if (item.ready) {
      const downloadMenuItems: MenuProps["items"] = [
        {
          key: "csv",
          label: "Exportar CSV",
          icon: <FileTextOutlined />,
          onClick: () => executeDownloadWithFormat(item.filename, "csv"),
        },
        {
          key: "xlsx",
          label: "Exportar XLSX",
          icon: <FileExcelOutlined />,
          onClick: () => executeDownloadWithFormat(item.filename, "xlsx"),
        },
      ];

      actions.push(
        <Dropdown
          menu={{ items: downloadMenuItems }}
          disabled={loading || isProcessing}
        >
          <Button
            icon={<DownloadOutlined />}
            loading={loading || isProcessing}
          />
        </Dropdown>,
      );

      actions.push(
        <Tooltip title="Visualizar">
          <Button
            icon={<EyeOutlined />}
            loading={loading || isProcessing}
            onClick={() => {
              openReportPreview(item.filename);
            }}
          />
        </Tooltip>,
      );
    }

    return (
      <List.Item actions={actions}>
        <List.Item.Meta
          avatar={
            <Avatar
              icon={<BarChartOutlined />}
              style={{ backgroundColor: "#a991d6", color: "#fff" }}
              size="large"
            />
          }
          title={title}
          description={
            item.ready
              ? `Processado em ${formatDateTime(item.updateAt)}`
              : `Processamento pendente`
          }
        />
      </List.Item>
    );
  };

  return (
    <Modal
      open={!!data}
      width={600}
      onCancel={() => dispatch(selectReport(null))}
      footer={null}
    >
      {data && (
        <>
          <header>
            <h2 className="modal-title">{data.name}</h2>
          </header>

          {data.status === ReportStatusEnum.PROCESSING && (
            <Alert
              showIcon
              type="info"
              message="Processando relatório..."
              description="O processamento pode demorar alguns minutos. Aguarde, por favor."
            />
          )}

          {data.status === ReportStatusEnum.ERROR && (
            <Alert
              showIcon
              type="error"
              message="Ocorreu um erro ao processar este arquivo"
              description={
                data.error_message
                  ? data.error_message
                  : "Tente reprocessar o relatório. Caso o problema persista, entre em contato através da Ajuda."
              }
            />
          )}

          {data.status === ReportStatusEnum.EMPTY && (
            <Alert
              showIcon
              type="warning"
              message="Resultado: Relatório vazio"
              description="Nenhum registro encontrado. Tente reprocessar o relatório mais tarde."
            />
          )}

          <List
            itemLayout="horizontal"
            dataSource={data.available_reports || []}
            renderItem={renderItems}
            pagination={{
              pageSize: 10,
              position: "bottom",
            }}
          />
        </>
      )}
    </Modal>
  );
}
