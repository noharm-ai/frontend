import React from "react";
import { useSelector } from "react-redux";
import { Card, Descriptions } from "antd";

import { formatDate } from "utils/date";

export default function RegulationPatient({ itemSpan }) {
  const patient = useSelector(
    (state) => state.regulation.regulation.data.patient
  );
  const patientDetails = useSelector(
    (state) => state.regulation.regulation.patient.data
  );
  const patientDetailsStatus = useSelector(
    (state) => state.regulation.regulation.patient.status
  );
  const items = [
    {
      key: "2",
      label: "Data de Nascimento",
      children: formatDate(patient.birthdate),
      span: itemSpan || 2,
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
      span: itemSpan || 2,
    },
    {
      key: "4",
      label: "Endereço",
      children: patientDetails?.data?.endereco,
      span: itemSpan || 4,
    },
    {
      key: "5",
      label: "Bairro",
      children: patientDetails?.data?.bairro,
      span: itemSpan || 2,
    },
    {
      key: "6",
      label: "Cidade",
      children: patientDetails?.data?.cidade,
      span: itemSpan || 2,
    },
    {
      key: "7",
      label: "Estado",
      children: patientDetails?.data?.estado,
      span: itemSpan || 2,
    },
    {
      key: "8",
      label: "CEP",
      children: patientDetails?.data?.cep,
      span: itemSpan || 2,
    },
  ];

  return (
    <Card
      title={patientDetails?.name || `Paciente ${patient?.id}`}
      bordered={false}
      loading={patientDetailsStatus === "loading"}
    >
      <Descriptions bordered items={items} column={4} size="middle" />
    </Card>
  );
}
