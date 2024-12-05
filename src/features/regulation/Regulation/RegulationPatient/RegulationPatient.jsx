import React from "react";
import { useSelector } from "react-redux";
import { Card, Descriptions } from "antd";

import { formatDate } from "utils/date";

export default function RegulationPatient() {
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
      children: patientDetails?.data?.endereco,
      span: 4,
    },
    {
      key: "5",
      label: "Bairro",
      children: patientDetails?.data?.bairro,
      span: 2,
    },
    {
      key: "6",
      label: "Cidade",
      children: patientDetails?.data?.cidade,
      span: 2,
    },
    {
      key: "7",
      label: "Estado",
      children: patientDetails?.data?.estado,
      span: 2,
    },
    {
      key: "8",
      label: "CEP",
      children: patientDetails?.data?.cep,
      span: 2,
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
