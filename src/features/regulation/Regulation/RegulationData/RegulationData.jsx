import React from "react";
import { Card, Descriptions } from "antd";

export default function RegulationData() {
  const items = [
    {
      key: "1",
      label: "Protocolo",
      children: "1243",
      span: 2,
    },
    {
      key: "2",
      label: "Data da Solicitação",
      children: "01/10/2024",
      span: 2,
    },
    {
      key: "3",
      label: "Procedimento solicitado",
      children: "03010022 - CONS. EM ENDOCRINOLOGIA",
      span: 4,
    },
    {
      key: "4",
      label: "Médico Solicitante",
      children: "João Pereira",
      span: 2,
    },
    {
      key: "5",
      label: "CRM",
      children: "2345",
      span: 2,
    },
    {
      key: "6",
      label: "Diagnóstico Inicial",
      children: "Exame Geral",
      span: 2,
    },
    {
      key: "7",
      label: "CID",
      children: "1231231231231",
      span: 2,
    },
    {
      key: "8",
      label: "Justificativa",
      children:
        "Pac sem comobirdades, já cumpriu todas as etapas do planejamento familiar. Gesta III Para III US de maio de 2015. PV em andamento",
      span: 4,
    },
  ];

  return (
    <Card title="Solicitação" bordered={false}>
      <Descriptions bordered items={items} column={4} size="middle" />
    </Card>
  );
}
