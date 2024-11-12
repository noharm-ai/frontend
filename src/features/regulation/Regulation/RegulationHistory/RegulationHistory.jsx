import React from "react";
import { ClockCircleFilled, CheckCircleFilled } from "@ant-design/icons";
import { Card, Flex, Timeline } from "antd";

import Button from "components/Button";

export default function RegulationHistory() {
  const items = [
    {
      dot: (
        <ClockCircleFilled
          style={{
            fontSize: "16px",
          }}
        />
      ),
      color: "#faad14",
      children: (
        <Flex vertical={true}>
          <div style={{ fontWeight: 500 }}>Aguardando Agendamento</div>
          <div style={{ fontWeight: 300, marginTop: "5px" }}>
            <Button type="primary">Ação</Button>
          </div>
        </Flex>
      ),
    },
    {
      dot: (
        <CheckCircleFilled
          style={{
            fontSize: "16px",
          }}
        />
      ),
      color: "green",
      children: (
        <Flex vertical={true}>
          <div style={{ fontWeight: 500 }}>02/10/2024 15:35</div>
          <div style={{ fontWeight: 300 }}>
            Etapa alterada de <strong>Não Iniciado</strong> para{" "}
            <strong>Aguardando Agendamento</strong>
          </div>
        </Flex>
      ),
    },
    {
      dot: (
        <CheckCircleFilled
          style={{
            fontSize: "16px",
          }}
        />
      ),
      color: "green",
      children: (
        <Flex vertical={true}>
          <div style={{ fontWeight: 500 }}>01/10/2024 13:35</div>
          <div style={{ fontWeight: 300 }}>Solicitação criada</div>
        </Flex>
      ),
    },
  ];

  return (
    <Card title="Histórico" bordered={false} style={{ height: "100%" }}>
      <Timeline items={items} />
    </Card>
  );
}
