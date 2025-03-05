import { useTranslation } from "react-i18next";
import { Collapse, Badge, CollapseProps } from "antd";

import { formatDate } from "utils/date";
import Tooltip from "components/Tooltip";

interface IProtocolsTabProps {
  protocolAlerts: any;
}

export function ProtocolsTab({ protocolAlerts }: IProtocolsTabProps) {
  const { t } = useTranslation();

  const items: CollapseProps["items"] = [];
  const protocolGroups = Object.keys(protocolAlerts)
    .filter((a) => a !== "summary")
    .sort();

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

  protocolGroups.forEach((g: string) => {
    if (protocolAlerts[g].length) {
      items.push({
        key: g,
        label: `Vigência: ${formatDate(g)}`,
        children: (
          <>
            {protocolAlerts[g].map((pa: any) => (
              <div key={pa.id} className="protocol-message">
                <div>
                  <Tooltip title={pa.description}>
                    <Badge
                      color={getIconColor(pa.level)}
                      style={{ marginRight: "0.5rem" }}
                    />
                    {pa.message}
                  </Tooltip>
                </div>
                {pa.variableMessages && (
                  <div className="protocol-variable">
                    {pa.variableMessages.map((v: string) => (
                      <div>- {v}</div>
                    ))}
                  </div>
                )}
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
        <div className="patient-data-item-value">
          <div className="protocol-group">
            <Collapse
              items={items}
              defaultActiveKey={protocolGroups}
              size="small"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
