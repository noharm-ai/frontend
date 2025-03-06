import { useTranslation } from "react-i18next";
import { Collapse, Badge, CollapseProps } from "antd";

import { formatDate } from "utils/date";
import Tooltip from "components/Tooltip";

interface IProtocolsTabProps {
  protocolAlerts: any;
}

interface IProtocolResult {
  id: number;
  description: string;
  level: string;
  message: string;
  variableMessages: string[];
}

export function ProtocolsTab({ protocolAlerts }: IProtocolsTabProps) {
  const { t } = useTranslation();

  const items: CollapseProps["items"] = [];
  const protocolGroups = Object.keys(protocolAlerts)
    .filter((a) => a !== "summary")
    .sort();

  const getSortedProtocols = (group: string) => {
    let protocols: IProtocolResult[] = [];

    ["high", "medium", "low"].forEach((level) => {
      protocols = [
        ...protocols,
        ...protocolAlerts[group].filter(
          (pa: IProtocolResult) => pa.level === level
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
                <Protocol protocolResult={pa} />
              </div>
            ))}
          </>
        ),
      });
    }
  });

  return (
    <div className="patient-data">
      <div className="patient-data-item full">
        <div className="patient-data-item-label">
          {t("labels.protocolAlerts")}
        </div>

        {protocolAlerts?.summary && protocolAlerts.summary.length > 0 ? (
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
            Nenhum protocolo encontrado
          </div>
        )}
      </div>
    </div>
  );
}

function Protocol({ protocolResult }: { protocolResult: IProtocolResult }) {
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
        <Tooltip title={protocolResult.description}>
          <Badge
            color={getIconColor(protocolResult.level)}
            style={{ marginRight: "0.5rem" }}
          />
          {protocolResult.message}
        </Tooltip>
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
