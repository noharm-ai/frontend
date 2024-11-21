import React from "react";
import { useSelector } from "react-redux";
import { Flex } from "antd";

import Tooltip from "components/Tooltip";
import RegulationStageTag from "components/RegulationStageTag";
import RegulationRiskTag from "components/RegulationRiskTag";

export default function RegulationStats() {
  const solicitation = useSelector((state) => state.regulation.regulation.data);
  const tagStyle = { fontSize: "24px", padding: "10px" };

  return (
    <Flex gap={20} align="center">
      <Tooltip title="Etapa atual">
        <RegulationStageTag stage={solicitation.stage} style={tagStyle} />
      </Tooltip>
      {solicitation.risk && (
        <Tooltip title="Risco">
          <RegulationRiskTag
            risk={solicitation.risk}
            tag={true}
            style={tagStyle}
          />
        </Tooltip>
      )}
    </Flex>
  );
}
