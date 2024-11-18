import React from "react";
import { Card, Descriptions } from "antd";

export default function RegulationPatient() {
  const items = [
    {
      key: "1",
      label: "Nome",
      children: "Luciana Almeida",
      span: 4,
    },
    {
      key: "2",
      label: "Data de Nascimento",
      children: "01/10/1975",
      span: 2,
    },
    {
      key: "3",
      label: "Sexo",
      children: "Feminino",
      span: 2,
    },
    {
      key: "4",
      label: "Endereço",
      children: "Av. Independência, 3456",
      span: 4,
    },
    {
      key: "5",
      label: "Bairro",
      children: "Bairro",
      span: 2,
    },
    {
      key: "6",
      label: "Cidade",
      children: "Cidade",
      span: 2,
    },
    {
      key: "7",
      label: "Estado",
      children: "Rio Grande do Sul",
      span: 2,
    },
    {
      key: "8",
      label: "CEP",
      children: "90000-000",
      span: 2,
    },
  ];

  return (
    <Card title="Paciente" bordered={false}>
      <Descriptions bordered items={items} column={4} size="middle" />
    </Card>
  );
}
