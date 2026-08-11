import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Collapse, Badge, CollapseProps, Flex } from "antd";
import { FileSearchOutlined } from "@ant-design/icons";

import { formatDate } from "utils/date";
import { getErrorMessage } from "utils/errorHandler";
import Tooltip from "components/Tooltip";
import Button from "components/Button";
import DefaultModal from "components/Modal";
import notification from "components/notification";
import { traceProtocol } from "features/serverActions/ServerActionsSlice";
import { useAppDispatch } from "store/index";
import Permission from "models/Permission";
import PermissionService from "services/PermissionService";

import { ProtocolTriggerDescription } from "components/ProtocolDescription/ProtocolTriggerDescription";

import { ProtocolTrace } from "./ProtocolTrace/ProtocolTrace";
import type { IPrescriptionTrace } from "./ProtocolTrace/types";

interface IProtocolsTabProps {
  protocolAlerts: any;
  idPrescription: number | string;
}

interface IProtocolResult {
  id: number;
  description: string;
  level: string;
  message: string;
  variableMessages: string[];
}

export function ProtocolsTab({
  protocolAlerts,
  idPrescription,
}: IProtocolsTabProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [traceLoading, setTraceLoading] = useState(false);
  const [trace, setTrace] = useState<IPrescriptionTrace | null>(null);
  const [described, setDescribed] = useState<IProtocolResult | null>(null);

  const items: CollapseProps["items"] = [];
  const protocolGroups = Object.keys(protocolAlerts)
    .filter((a) => a !== "summary" && a !== "items")
    .sort()
    .reverse();
  const hasAlerts = protocolGroups.some((g) => protocolAlerts[g].length > 0);

  const getSortedProtocols = (group: string) => {
    let protocols: IProtocolResult[] = [];

    ["high", "medium", "low"].forEach((level) => {
      protocols = [
        ...protocols,
        ...protocolAlerts[group].filter(
          (pa: IProtocolResult) => pa.level === level,
        ),
      ];
    });

    return protocols;
  };

  protocolGroups.forEach((g: string) => {
    if (protocolAlerts[g].length) {
      items.push({
        key: g,
        label: `Vigência: ${formatDate(g)}`,
        children: (
          <>
            {getSortedProtocols(g).map((pa: IProtocolResult) => (
              <div key={pa.id} className="protocol-message">
                <Protocol protocolResult={pa} onDescribe={setDescribed} />
              </div>
            ))}
          </>
        ),
      });
    }
  });

  const explainProtocols = () => {
    setTraceLoading(true);

    dispatch(traceProtocol({ idPrescription })).then((response: any) => {
      setTraceLoading(false);

      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        setTrace(response.payload.data);
      }
    });
  };

  return (
    <div className="patient-data">
      <div className="patient-data-item full">
        <Flex justify="space-between" align="center">
          <div className="patient-data-item-label">
            {t("labels.protocolAlerts")}
          </div>

          {PermissionService().has(Permission.MAINTAINER) && (
            <Button
              size="small"
              icon={<FileSearchOutlined />}
              loading={traceLoading}
              onClick={explainProtocols}
              style={{ marginRight: "10px", marginBottom: "5px" }}
            >
              {t("buttons.explainProtocols")}
            </Button>
          )}
        </Flex>

        {hasAlerts ? (
          <div className="patient-data-item-value">
            <div className="protocol-group">
              <Collapse
                items={items}
                defaultActiveKey={protocolGroups}
                size="small"
              />
            </div>
          </div>
        ) : (
          <div className="patient-data-item-value">
            Nenhum protocolo geral encontrado
          </div>
        )}
      </div>

      <DefaultModal
        title={t("titles.protocolTrace")}
        destroyOnHidden
        open={trace != null}
        onCancel={() => setTrace(null)}
        width="min(1200px, 96vw)"
        style={{ top: 20 }}
        styles={{
          container: { paddingLeft: 0, paddingRight: 0, paddingBottom: 0 },
          header: { paddingLeft: 24, paddingRight: 24 },
          body: { height: "80vh", padding: 0 },
        }}
        footer={null}
      >
        {trace && <ProtocolTrace trace={trace} />}
      </DefaultModal>

      <DefaultModal
        title={t("titles.protocolDescription")}
        destroyOnHidden
        open={described != null}
        onCancel={() => setDescribed(null)}
        width="min(700px, 96vw)"
        footer={null}
      >
        {described && <ProtocolTriggerDescription idProtocol={described.id} />}
      </DefaultModal>
    </div>
  );
}

function Protocol({
  protocolResult,
  onDescribe,
}: {
  protocolResult: IProtocolResult;
  onDescribe: (protocolResult: IProtocolResult) => void;
}) {
  const { t } = useTranslation();

  const getIconColor = (level: string) => {
    switch (level) {
      case "high":
        return "#f44336";
      case "medium":
        return "#f57f17";
      case "low":
        return "#ffc107";
      default:
        return "#f44336";
    }
  };

  return (
    <>
      <div>
        <Flex>
          <Badge
            color={getIconColor(protocolResult.level)}
            style={{ marginRight: "0.5rem" }}
          />

          <Tooltip
            title={
              <>
                <div className="protocol-describe-hint">
                  {t("tooltips.protocolDescription")}
                </div>
              </>
            }
          >
            <button
              type="button"
              className="protocol-describe"
              onClick={() => onDescribe(protocolResult)}
            >
              {protocolResult.message}
            </button>
          </Tooltip>
        </Flex>
      </div>
      {protocolResult.variableMessages && (
        <div className="protocol-variable">
          {protocolResult.variableMessages.map((v: string, index: number) => (
            <div key={index}>- {v}</div>
          ))}
        </div>
      )}
    </>
  );
}
