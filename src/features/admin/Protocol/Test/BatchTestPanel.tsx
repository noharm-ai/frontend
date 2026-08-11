import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import { Flex, Progress, Space, Tag } from "antd";
import { PlayCircleOutlined } from "@ant-design/icons";

import api from "services/api";
import Button from "components/Button";
import notification from "components/notification";
import { InputNumber, Select } from "components/Inputs";
import { getErrorMessageFromException } from "utils/errorHandler";
import { fetchSegmentsListThunk } from "store/ducks/segments/thunk";

import { IProtocolFormBaseFields } from "../Form/types";
import { CHUNK_SIZE } from "./constants";
import { ITestResultRow } from "./types";
import { BatchResultsModal } from "./BatchResultsModal";

type Phase = "form" | "running" | "finished";

export function BatchTestPanel() {
  const { t } = useTranslation();
  const dispatch = useDispatch<any>();
  const { values } = useFormikContext<IProtocolFormBaseFields>();
  const [phase, setPhase] = useState<Phase>("form");
  const [sampleSize, setSampleSize] = useState<number>(100);
  const [idSegment, setIdSegment] = useState<number | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<ITestResultRow[]>([]);
  const [resultsOpen, setResultsOpen] = useState(false);
  const cancelledRef = useRef(false);

  const segments = useSelector((state: any) => state.segments.list ?? []);

  useEffect(() => {
    dispatch(fetchSegmentsListThunk());
  }, [dispatch]);

  const runTest = async () => {
    if (
      !values.protocolType ||
      !values.config?.trigger ||
      !values.config?.variables?.length
    ) {
      notification.warning({
        message: t("validation.requiredField"),
        description: t("labels.protocolTestRequirements"),
      });
      return;
    }

    cancelledRef.current = false;
    setResults([]);
    setPhase("running");
    setProgress({ current: 0, total: 0 });

    let ids: string[] = [];
    try {
      const sampleResponse = await api.protocols.testSample({
        protocolType: values.protocolType,
        idSegment,
        limit: sampleSize,
      });
      ids = sampleResponse.data.data.idPrescriptionList;
    } catch (error: any) {
      notification.error({
        message: getErrorMessageFromException(error?.response?.data, t),
      });
      setPhase("form");
      return;
    }

    if (!ids.length) {
      notification.warning({ message: t("labels.protocolTestEmptySample") });
      setPhase("form");
      return;
    }

    setProgress({ current: 0, total: ids.length });

    const collected: ITestResultRow[] = [];
    let completed = 0;
    for (let i = 0; i < ids.length; i += CHUNK_SIZE) {
      if (cancelledRef.current) break;

      const chunk = ids.slice(i, i + CHUNK_SIZE);
      try {
        const response = await api.protocols.testConfig({
          config: values.config,
          protocolType: values.protocolType,
          idPrescriptionList: chunk,
        });
        collected.push(...response.data.data.results);
      } catch (error: any) {
        notification.error({
          message: getErrorMessageFromException(error?.response?.data, t),
        });
      }

      completed += chunk.length;
      setProgress({ current: completed, total: ids.length });
    }

    setResults(collected);
    setPhase("finished");

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

  if (phase === "running") {
    return (
      <Flex vertical align="center" gap={16} style={{ padding: "16px 0" }}>
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
    );
  }

  if (phase === "finished") {
    return (
      <>
        <Flex vertical gap={16}>
          <Space wrap>
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
          <Space>
            <Button type="primary" onClick={() => setResultsOpen(true)}>
              {t("buttons.viewResults")}
            </Button>
            <Button onClick={() => setPhase("form")}>
              {t("buttons.newTest")}
            </Button>
          </Space>
        </Flex>

        <BatchResultsModal
          open={resultsOpen}
          onClose={() => setResultsOpen(false)}
          results={results}
          protocol={values}
        />
      </>
    );
  }

  return (
    <>
      <div className="form-row">
        <div className="form-label">
          <label>{t("labels.sampleSize")}:</label>
        </div>
        <div className="form-input">
          <InputNumber
            min={1}
            max={200}
            value={sampleSize}
            onChange={(value: number | null) => setSampleSize(value || 100)}
            style={{ width: "100%" }}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-label">
          <label>{t("labels.segment")}:</label>
        </div>
        <div className="form-input">
          <Select
            style={{ width: "100%" }}
            value={idSegment}
            onChange={(value) => setIdSegment((value as number) ?? null)}
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder={t("labels.allSegments")}
            options={segments.map((s: any) => ({
              value: s.id,
              label: s.description,
            }))}
          />
        </div>
      </div>

      <div className="form-row">
        <Button
          id="protocol-batch-run"
          type="primary"
          icon={<PlayCircleOutlined />}
          onClick={runTest}
          block
        >
          {t("labels.protocolTestRun")}
        </Button>
      </div>
    </>
  );
}
