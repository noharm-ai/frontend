import { Tag, Badge } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";

import Tooltip from "src/components/Tooltip";
import { GraphHeaderContainer } from "../IntegrationRemote.style";

interface IGraphHeaderProps {
  title: string;
  templateDate: string;
  templateStatus: any;
}

export function GraphHeader({
  title,
  templateDate,
  templateStatus,
}: IGraphHeaderProps) {
  const stats: any = {
    Running: {
      color: "#52c41a",
      label: "Executando",
      count: 0,
    },
    Stopped: {
      color: "#ff4d4f",
      label: "Parado",
      count: 0,
    },
    Invalid: {
      color: "#faad14",
      label: "Inválido",
      count: 0,
    },
    Disabled: {
      color: "gray",
      label: "Desativado",
      count: 0,
    },
  };

  Object.values(templateStatus).forEach((item: any) => {
    if (item.runStatus && stats[item.runStatus]) {
      stats[item.runStatus].count += 1;
    }
  });

  return (
    <GraphHeaderContainer>
      <div className="header-info">
        <Tag color="#a991d6">{localStorage.getItem("schema")}</Tag>

        <div className="header-title">{title}</div>
      </div>
      <div className="folder-stats">
        {Object.values(stats).map((item: any) => (
          <Tooltip key={item.label} title={`${item.label} (${item.count})`}>
            <Badge
              count={item.count}
              showZero
              color={item.color}
              overflowCount={999}
            />
          </Tooltip>
        ))}

        <div className="template-date">
          <Tooltip title="Última atualização do template">
            <Tag icon={<ClockCircleOutlined />}>{templateDate}</Tag>
          </Tooltip>
        </div>
      </div>
    </GraphHeaderContainer>
  );
}
