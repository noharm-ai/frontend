import React from "react";
import { Flex } from "antd";

import RegulationStageTag from "components/RegulationStageTag";
import RegulationRiskTag from "components/RegulationRiskTag";

export default function RegulationStats() {
  const tagStyle = { fontSize: "24px", padding: "10px" };

  return (
    <Flex gap={20} align="center">
      <RegulationStageTag stage={"WAITING_SCHEDULE"} style={tagStyle} />
      <RegulationRiskTag risk={4} />
    </Flex>
  );
}
