import React from "react";
import { useSelector } from "react-redux";
import { Card, Descriptions } from "antd";

import { formatDate } from "utils/date";

export default function RegulationPatient({ print = false }) {
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
      span: print ? 4 : 2,
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
      span: print ? 4 : 2,
    },
    {
      key: "9",
      label: "CNS",
      children: patientDetails?.data?.cns,
      span: print ? 4 : 2,
    },
    {
      key: "10",
      label: "CPF",
      children: patientDetails?.data?.cpf,
      span: print ? 4 : 2,
    },
    {
      key: "4",
      label: "Endereço",
      children: patientDetails?.data?.endereco,
      span: print ? 4 : 4,
    },
    {
      key: "5",
      label: "Bairro",
      children: patientDetails?.data?.bairro,
      span: print ? 4 : 2,
    },
    {
      key: "6",
      label: "Cidade",
      children: patientDetails?.data?.cidade,
      span: print ? 4 : 2,
    },
    {
      key: "7",
      label: "Estado",
      children: patientDetails?.data?.estado,
      span: print ? 4 : 2,
    },
    {
      key: "8",
      label: "CEP",
      children: patientDetails?.data?.cep,
      span: print ? 4 : 2,
    },
    {
      key: "11",
      label: "Telefone Residencial",
      children: patientDetails?.data?.telefone_residencial,
      span: print ? 4 : 2,
    },
    {
      key: "12",
      label: "Celular",
      children: patientDetails?.data?.telefone_celular,
      span: print ? 4 : 2,
    },
    {
      key: "13",
      label: "Telefone contato",
      children: patientDetails?.data?.telefone_contato,
      span: print ? 4 : 2,
    },
    {
      key: "14",
      label: "Agente de saúde",
      children: patientDetails?.data?.agente_saude,
      span: print ? 4 : 2,
    },
    {
      key: "15",
      label: "Equipe",
      children: patientDetails?.data?.equipe,
      span: print ? 4 : 2,
    },
    {
      key: "16",
      label: "Unidade de saúde",
      children: patientDetails?.data?.unidade_saude,
      span: print ? 4 : 2,
    },
  ];

  return (
    <Card
      title={patientDetails?.name || `Paciente ${patient?.id}`}
      variant="borderless"
      loading={patientDetailsStatus === "loading"}
    >
      <Descriptions
        bordered
        items={items}
        column={4}
        size={print ? "small" : "middle"}
      />
    </Card>
  );
}
