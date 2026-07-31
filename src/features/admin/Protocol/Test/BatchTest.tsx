import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Flex, Progress, Space, Table, Tag, Tooltip } from "antd";
import {
  ExportOutlined,
  FileSearchOutlined,
  WarningOutlined,
} from "@ant-design/icons";

import api from "services/api";
import Button from "components/Button";
import notification from "components/notification";
import { InputNumber, Select } from "components/Inputs";
import { getErrorMessageFromException } from "utils/errorHandler";
import { fetchSegmentsListThunk } from "store/ducks/segments/thunk";

import { IProtocolFormBaseFields } from "../Form/types";
import { CHUNK_SIZE } from "./constants";
import { ITestResultRow } from "./types";
import { TestDetailModal } from "./TestDetailModal";
import { useProtocolTestDetail } from "./useProtocolTestDetail";

interface BatchTestProps {
  protocol: IProtocolFormBaseFields;
  processing: boolean;
  setProcessing: (value: boolean) => void;
}

export function BatchTest({
  protocol,
  processing,
  setProcessing,
}: BatchTestProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch<any>();
  const [sampleSize, setSampleSize] = useState<number>(100);
  const [idSegment, setIdSegment] = useState<number | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<ITestResultRow[]>([]);
  const [finished, setFinished] = useState(false);
  const { detailId, detailTrace, openDetail, closeDetail } =
    useProtocolTestDetail(protocol);
  const cancelledRef = useRef(false);

  const segments = useSelector((state: any) => state.segments.list ?? []);

  useEffect(() => {
    dispatch(fetchSegmentsListThunk());
  }, [dispatch]);

  const runTest = async () => {
    cancelledRef.current = false;
    setResults([]);
    setFinished(false);
    setProcessing(true);

    let ids: string[] = [];
    try {
      const sampleResponse = await api.protocols.testSample({
        protocolType: protocol.protocolType,
        idSegment,
        limit: sampleSize,
      });
      ids = sampleResponse.data.data.idPrescriptionList;
    } catch (error: any) {
      notification.error({
        message: getErrorMessageFromException(error?.response?.data, t),
      });
      setProcessing(false);
      return;
    }

    if (!ids.length) {
      notification.warning({ message: t("labels.protocolTestEmptySample") });
      setProcessing(false);
      return;
    }

    setProgress({ current: 0, total: ids.length });

    let completed = 0;
    for (let i = 0; i < ids.length; i += CHUNK_SIZE) {
      if (cancelledRef.current) break;

      const chunk = ids.slice(i, i + CHUNK_SIZE);
      try {
        const response = await api.protocols.testConfig({
          config: protocol.config,
          protocolType: protocol.protocolType,
          idPrescriptionList: chunk,
        });
        setResults((prev) => [...prev, ...response.data.data.results]);
      } catch (error: any) {
        notification.error({
          message: getErrorMessageFromException(error?.response?.data, t),
        });
      }

      completed += chunk.length;
      setProgress({ current: completed, total: ids.length });
    }

    setProcessing(false);
    setFinished(true);

    if (cancelledRef.current) {
      notification.warning({ message: t("labels.operationCancelled") });
    }
  };

  const percent =
    progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : 0;

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
    <>
      <Flex align="flex-end" gap={16} wrap>
        <div>
          <div style={{ marginBottom: "4px" }}>
            <label>{t("labels.sampleSize")}</label>
          </div>
          <InputNumber
            min={1}
            max={200}
            value={sampleSize}
            onChange={(value: number | null) => setSampleSize(value || 100)}
            disabled={processing}
          />
        </div>
        <div style={{ minWidth: "300px" }}>
          <div style={{ marginBottom: "4px" }}>
            <label>{t("labels.segment")}</label>
          </div>
          <Select
            style={{ width: "100%" }}
            value={idSegment}
            onChange={(value) => setIdSegment((value as number) ?? null)}
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder={t("labels.allSegments")}
            disabled={processing}
            options={segments.map((s: any) => ({
              value: s.id,
              label: s.description,
            }))}
          />
        </div>
        <Button type="primary" onClick={runTest} disabled={processing}>
          {t("labels.protocolTestRun")}
        </Button>
      </Flex>

      {processing && (
        <Flex
          vertical
          align="center"
          gap={16}
          style={{ padding: "24px 0" }}
        >
          <Progress
            type="circle"
            percent={percent}
            format={() => `${progress.current}/${progress.total}`}
          />
          <Button
            danger
            onClick={() => {
              cancelledRef.current = true;
            }}
          >
            {t("actions.cancel")}
          </Button>
        </Flex>
      )}

      {results.length > 0 && (
        <div style={{ marginTop: "16px" }}>
          {finished && (
            <Space style={{ marginBottom: "8px" }}>
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
          )}
          <Table
            columns={columns}
            dataSource={results}
            rowKey="idPrescription"
            size="small"
            pagination={{ pageSize: 25, showSizeChanger: false }}
          />
        </div>
      )}

      <TestDetailModal trace={detailTrace} onClose={closeDetail} />
    </>
  );
}
