import { useState } from "react";
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

type SituationFilter = "activated" | "notActivated" | "error";

const isError = (row: ITestResultRow) => !!row.error;
const isActivated = (row: ITestResultRow) => !!row.activated && !row.error;
const isNotActivated = (row: ITestResultRow) => !row.activated && !row.error;

const filterPredicates: Record<
  SituationFilter,
  (row: ITestResultRow) => boolean
> = {
  activated: isActivated,
  notActivated: isNotActivated,
  error: isError,
};

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
  const [situationFilter, setSituationFilter] =
    useState<SituationFilter | null>(null);
  const [page, setPage] = useState(1);

  const activatedCount = results.filter(isActivated).length;
  const notActivatedCount = results.filter(isNotActivated).length;
  const errorCount = results.filter(isError).length;

  const filteredResults = situationFilter
    ? results.filter(filterPredicates[situationFilter])
    : results;

  const toggleFilter = (filter: SituationFilter) => {
    setSituationFilter((current) => (current === filter ? null : filter));
    setPage(1);
  };

  const filterTagProps = (filter: SituationFilter) => ({
    onClick: () => toggleFilter(filter),
    style: {
      cursor: "pointer",
      opacity: situationFilter && situationFilter !== filter ? 0.45 : 1,
    },
  });

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
        <Tag color="green" {...filterTagProps("activated")}>
          {t("labels.activated")}: {activatedCount}
        </Tag>
        <Tag {...filterTagProps("notActivated")}>
          {t("labels.notActivated")}: {notActivatedCount}
        </Tag>
        {errorCount > 0 && (
          <Tag color="red" {...filterTagProps("error")}>
            {t("labels.error")}: {errorCount}
          </Tag>
        )}
      </Space>
      <Table
        columns={columns}
        dataSource={filteredResults}
        rowKey="idPrescription"
        size="small"
        pagination={{
          current: page,
          pageSize: 25,
          showSizeChanger: false,
          onChange: setPage,
        }}
      />
      <TestDetailModal trace={detailTrace} onClose={closeDetail} />
    </DefaultModal>
  );
}
