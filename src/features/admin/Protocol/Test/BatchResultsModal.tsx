import { useTranslation } from "react-i18next";
import { Space, Table, Tag, Tooltip } from "antd";
import {
  ExportOutlined,
  FileSearchOutlined,
  WarningOutlined,
} from "@ant-design/icons";

import Button from "components/Button";
import DefaultModal from "components/Modal";

import { IProtocolFormBaseFields } from "../Form/types";
import { ITestResultRow } from "./types";
import { TestDetailModal } from "./TestDetailModal";
import { useProtocolTestDetail } from "./useProtocolTestDetail";

interface BatchResultsModalProps {
  open: boolean;
  onClose: () => void;
  results: ITestResultRow[];
  protocol: IProtocolFormBaseFields;
}

export function BatchResultsModal({
  open,
  onClose,
  results,
  protocol,
}: BatchResultsModalProps) {
  const { t } = useTranslation();
  const { detailId, detailTrace, openDetail, closeDetail } =
    useProtocolTestDetail(protocol);

  const activatedCount = results.filter((r) => r.activated).length;
  const errorCount = results.filter((r) => r.error).length;
  const notActivatedCount = results.length - activatedCount - errorCount;

  const columns = [
    {
      title: t("tableHeader.prescription"),
      dataIndex: "idPrescription",
      render: (id: string) => (
        <a href={`/prescricao/${id}`} target="_blank" rel="noreferrer">
          {id} <ExportOutlined />
        </a>
      ),
    },
    {
      title: t("labels.situation"),
      render: (_: unknown, row: ITestResultRow) => {
        if (row.error) {
          return <Tag color="red">{t("labels.error")}</Tag>;
        }
        return row.activated ? (
          <Tag color="green">{t("labels.activated")}</Tag>
        ) : (
          <Tag>{t("labels.notActivated")}</Tag>
        );
      },
    },
    {
      title: "",
      width: 40,
      render: (_: unknown, row: ITestResultRow) =>
        row.typeMatch === false ? (
          <Tooltip title={t("labels.typeMismatch")}>
            <WarningOutlined style={{ color: "#faad14" }} />
          </Tooltip>
        ) : null,
    },
    {
      title: t("labels.summary"),
      render: (_: unknown, row: ITestResultRow) => {
        if (row.error) {
          return row.error;
        }
        const group =
          (row.dateGroups || []).find((g) => g.activated) ||
          (row.dateGroups || [])[0];
        return group?.summary || group?.error || "-";
      },
    },
    {
      title: "",
      width: 60,
      render: (_: unknown, row: ITestResultRow) =>
        row.error ? null : (
          <Tooltip title={t("buttons.viewDetails")}>
            <Button
              size="small"
              icon={<FileSearchOutlined />}
              loading={detailId === row.idPrescription}
              disabled={detailId !== null && detailId !== row.idPrescription}
              onClick={() => openDetail(row)}
            />
          </Tooltip>
        ),
    },
  ];

  return (
    <DefaultModal
      title={t("titles.protocolTestResults")}
      destroyOnHidden
      open={open}
      onCancel={onClose}
      width="min(1200px, 96vw)"
      style={{ top: 20 }}
      styles={{ body: { maxHeight: "80vh", overflowY: "auto" } }}
      footer={null}
    >
      <Space style={{ marginBottom: "8px" }} wrap>
        <Tag color="green">
          {t("labels.activated")}: {activatedCount}
        </Tag>
        <Tag>
          {t("labels.notActivated")}: {notActivatedCount}
        </Tag>
        {errorCount > 0 && (
          <Tag color="red">
            {t("labels.error")}: {errorCount}
          </Tag>
        )}
      </Space>
      <Table
        columns={columns}
        dataSource={results}
        rowKey="idPrescription"
        size="small"
        pagination={{ pageSize: 25, showSizeChanger: false }}
      />
      <TestDetailModal trace={detailTrace} onClose={closeDetail} />
    </DefaultModal>
  );
}
