import React from "react";
import styled from "styled-components";

import Descriptions from "components/Descriptions";
import { formatDate } from "src/utils/date";
import { formatCpf } from "src/utils/number";

const NestedTableContainer = styled.div`
  .ant-descriptions-item-label {
    font-weight: 600;
    color: #2e3c5a !important;
    width: 20%;
    text-align: right;
  }
`;

const expandedRowRender = (record) => {
  const items = [
    {
      label: "Data de Nascimento",
      children: formatDate(record.birthdate),
      span: 3,
    },
    {
      label: "CPF",
      children: formatCpf(record.cpf),
      span: 3,
    },
    {
      label: "CNS",
      children: record.cns,
      span: 3,
    },
    {
      label: "CIAP",
      children: record.ciap,
      span: 3,
    },
    {
      label: "CID",
      children: record.icd,
      span: 3,
    },
    {
      label: "Endereço",
      children: record.address,
      span: 3,
    },
    {
      label: "Unidade de Saúde",
      children: record.health_unit,
      span: 3,
    },
    {
      label: "Agente de Saúde",
      children: record.health_agent,
      span: 3,
    },
    {
      label: "Equipe Responsável",
      children: record.responsible_team,
      span: 3,
    },
    {
      label: "Idade Gestacional",
      children: record.gestational_age,
      span: 3,
    },
    {
      label: "Data Consulta Gestacional",
      children: record.gestational_appointment_date,
      span: 3,
    },
    {
      label: "Data Consulta Gestacional",
      children: record.gestational_appointment_date,
      span: 3,
    },
    {
      label: "Data Consulta HPV",
      children: record.hpv_appointment_date,
      span: 3,
    },
    {
      label: "Data Exame Mamografia",
      children: record.mammogram_appointment_date,
      span: 3,
    },
    {
      label: "Data Consulta Saúde Sexual e Reprodutiva",
      children: record.sexattention_appointment_date,
      span: 3,
    },
  ];
  return (
    <NestedTableContainer>
      <Descriptions bordered size="small" items={items}></Descriptions>
    </NestedTableContainer>
  );
};

export default expandedRowRender;
