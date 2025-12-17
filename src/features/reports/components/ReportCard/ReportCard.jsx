import React from "react";
import { Avatar } from "antd";

import Heading from "components/Heading";
import Tooltip from "components/Tooltip";
import Alert from "components/Alert";
import { Wrapper, Excerpt } from "./ReportCard.style";
import { PieChartOutlined, BarChartOutlined } from "@ant-design/icons";

export default function ReportCard({ id, reportData, showReport, ...props }) {
  return (
    <Tooltip title="Abrir Relatório">
      <Wrapper id={id} {...props} onClick={() => showReport(reportData)}>
        {reportData.icon && (
          <Avatar
            icon={<PieChartOutlined />}
            style={{
              backgroundColor: "#a991d6",
              color: "#fff",
              display: "block",
            }}
            size="large"
          />
        )}
        {reportData.type === "custom" && (
          <Avatar
            icon={<BarChartOutlined />}
            style={{
              backgroundColor: "#a991d6",
              color: "#fff",
              display: "block",
            }}
            size="large"
          />
        )}
        <Heading as="h4" $size="16px" $margin="18px 0 15px" $textAlign="center">
          {reportData.title}
        </Heading>

        <Excerpt $margin="0 0 30px">{reportData.description}</Excerpt>

        {reportData.type === "internal" && !reportData.visible && (
          <Alert
            type="warning"
            description="Este relatório não está habilitado para os usuários. Acesse Curadoria->Relatórios para ativá-lo."
          ></Alert>
        )}
        {reportData.type === "custom" && !reportData.visible && (
          <Alert
            type="warning"
            description="Este relatório não está ativo para os usuários. Acesse Curadoria->Relatórios Customizados para ativá-lo."
          ></Alert>
        )}
      </Wrapper>
    </Tooltip>
  );
}
