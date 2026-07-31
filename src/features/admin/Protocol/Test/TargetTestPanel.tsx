import { useState } from "react";
import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import { Flex, Space, Tag, Tooltip } from "antd";
import { FileSearchOutlined, PlayCircleOutlined } from "@ant-design/icons";

import api from "services/api";
import Button from "components/Button";
import notification from "components/notification";
import { Select } from "components/Inputs";
import { getErrorMessageFromException } from "utils/errorHandler";

import { IProtocolFormBaseFields } from "../Form/types";
import { CHUNK_SIZE } from "./constants";
import { ITestResultRow } from "./types";
import { TestDetailModal } from "./TestDetailModal";
import { useProtocolTestDetail } from "./useProtocolTestDetail";

export function TargetTestPanel() {
  const { t } = useTranslation();
  const { values } = useFormikContext<IProtocolFormBaseFields>();
  const [ids, setIds] = useState<string[]>([]);
  const [results, setResults] = useState<ITestResultRow[]>([]);
  const [loading, setLoading] = useState(false);
  const { detailId, detailTrace, openDetail, closeDetail } =
    useProtocolTestDetail(values);

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

    setLoading(true);
    setResults([]);

    const collected: ITestResultRow[] = [];
    for (let i = 0; i < ids.length; i += CHUNK_SIZE) {
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
    }

    setResults(collected);
    setLoading(false);
  };

  return (
    <>
      <div className="form-row">
        <div className="form-label">
          <label>{t("labels.protocolTestIds")}:</label>
        </div>
        <div className="form-input">
          <Select
            id="protocol-test-ids"
            mode="tags"
            style={{ width: "100%" }}
            value={ids}
            onChange={(value) =>
              setIds((value as string[]).filter((v) => /^\d+$/.test(v)))
            }
            tokenSeparators={[",", " "]}
            open={false}
            suffixIcon={null}
            placeholder={t("labels.protocolTestAddId")}
            disabled={loading}
          />
        </div>
      </div>

      <div className="form-row">
        <Button
          id="protocol-test-run"
          type="primary"
          icon={<PlayCircleOutlined />}
          onClick={runTest}
          loading={loading}
          disabled={!ids.length || loading}
          block
        >
          {t("labels.protocolTestRun")}
        </Button>
      </div>

      {results.length > 0 && (
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {results.map((row) => (
            <li
              key={row.idPrescription}
              style={{
                padding: "8px 0",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <Flex justify="space-between" align="center">
                <a
                  href={`/prescricao/${row.idPrescription}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {row.idPrescription}
                </a>
                <Space>
                  {row.error ? (
                    <Tooltip title={row.error}>
                      <Tag color="red">{t("labels.error")}</Tag>
                    </Tooltip>
                  ) : row.activated ? (
                    <Tag color="green">{t("labels.activated")}</Tag>
                  ) : (
                    <Tag>{t("labels.notActivated")}</Tag>
                  )}
                  {!row.error && (
                    <Tooltip title={t("buttons.viewDetails")}>
                      <Button
                        size="small"
                        icon={<FileSearchOutlined />}
                        loading={detailId === row.idPrescription}
                        disabled={
                          detailId !== null &&
                          detailId !== row.idPrescription
                        }
                        onClick={() => openDetail(row)}
                      />
                    </Tooltip>
                  )}
                </Space>
              </Flex>
            </li>
          ))}
        </ul>
      )}

      <TestDetailModal trace={detailTrace} onClose={closeDetail} />
    </>
  );
}
