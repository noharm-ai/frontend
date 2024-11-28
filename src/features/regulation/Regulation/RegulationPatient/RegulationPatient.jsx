import React from "react";
import { useSelector } from "react-redux";
import { Card, Descriptions } from "antd";

import { formatDate } from "utils/date";

export default function RegulationPatient() {
  const patient = useSelector(
    (state) => state.regulation.regulation.data.patient
  );
  const items = [
    {
      key: "1",
      label: "Nome",
      children: patient?.name || `Paciente ${patient?.id}`,
      span: 4,
    },
    {
      key: "2",
      label: "Data de Nascimento",
      children: formatDate(patient.birthdate),
      span: 2,
    },
    {
      key: "3",
      label: "Sexo",
      children: (
        <>
          {patient.gender === "F" && "Feminino"}
          {patient.gender === "M" && "Masculino"}
          {patient.gender !== "M" && patient.gender !== "F" && patient.gender}
        </>
      ),
      span: 2,
    },
    {
      key: "4",
      label: "Endereço",
      children: null,
      span: 4,
    },
    {
      key: "5",
      label: "Bairro",
      children: null,
      span: 2,
    },
    {
      key: "6",
      label: "Cidade",
      children: null,
      span: 2,
    },
    {
      key: "7",
      label: "Estado",
      children: null,
      span: 2,
    },
    {
      key: "8",
      label: "CEP",
      children: null,
      span: 2,
    },
  ];

  return (
    <Card title="Paciente" bordered={false}>
      <Descriptions bordered items={items} column={4} size="middle" />
    </Card>
  );
}
