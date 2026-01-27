import React from "react";
import { useSelector } from "react-redux";
import {
  ClockCircleFilled,
  CheckCircleFilled,
  CloseCircleFilled,
} from "@ant-design/icons";
import { Card, Timeline } from "antd";

import RegulationStage from "models/regulation/RegulationStage";
import HistoryEntry from "./components/HistoryEntry";

export default function RegulationHistory() {
  const solicitation = useSelector((state) => state.regulation.regulation.data);
  const movements = useSelector(
    (state) => state.regulation.regulation.data.movements,
  );

  const getCurrentStageConfig = () => {
    switch (solicitation.stage) {
      case RegulationStage.FINISHED:
        return {
          dot: (
            <CheckCircleFilled
              style={{
                fontSize: "16px",
              }}
            />
          ),
          color: "green",
        };

      case 98:
        return {
          dot: (
            <CloseCircleFilled
              style={{
                fontSize: "16px",
              }}
            />
          ),
          color: "red",
        };

      default:
        return {
          dot: (
            <ClockCircleFilled
              style={{
                fontSize: "16px",
              }}
            />
          ),
          color: "#faad14",
        };
    }
  };

  const items = [];

  items.push({
    ...getCurrentStageConfig(),
    children: <HistoryEntry movement={{ origin: solicitation.stage }} first />,
  });

  movements.forEach((move) => {
    if (move.action === -1) {
      items.push({
        dot: (
          <CheckCircleFilled
            style={{
              fontSize: "16px",
            }}
          />
        ),
        color: "green",
        children: <HistoryEntry movement={move} />,
      });
      return;
    }

    items.push({
      dot: (
        <CheckCircleFilled
          style={{
            fontSize: "16px",
          }}
        />
      ),
      color: "green",
      children: <HistoryEntry movement={move} />,
    });
  });

  return (
    <Card title="Histórico" variant="borderless" style={{ height: "100%" }}>
      <Timeline items={items} />
    </Card>
  );
}
