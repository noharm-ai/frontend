import React from "react";
import { useSelector } from "react-redux";
import { Table } from "antd";

import { formatCurrency } from "utils/number";
import { formatDate } from "utils/date";

export default function EconomyList() {
  const datasource = useSelector(
    (state) => state.reportsArea.economy.filtered.result.list
  );

  const columns = [
    {
      title: "ID",
      width: 2,
      fixed: "left",
      align: "center",
      render: (_, record) => record.idIntervention,
    },
    {
      title: "#Atendimento",
      width: 4,
      fixed: "left",
      align: "center",
      render: (_, record) => record.admissionNumber,
    },
    {
      title: "Economia",
      width: 4,
      fixed: "left",
      align: "right",
      render: (_, record) =>
        `R$ ${formatCurrency(record.processed.economyValue, 2)}`,
    },

    {
      title: "Qtd. Dias Economia",
      width: 3,
      align: "right",
      render: (_, record) => record.processed.economyDays,
    },
    {
      title: "Data Inicial",
      width: 5,
      render: (_, record) => formatDate(record.processed.iniEconomyDate),
    },
    {
      title: "Data Final",
      width: 5,
      render: (_, record) => formatDate(record.processed.endEconomyDate),
    },
    {
      title: "Tipo Economia",
      width: 5,
      render: (_, record) => record.economyTypeDescription,
    },
    {
      title: "Situação",
      width: 5,
      render: (_, record) => record.status,
    },
    {
      title: "Economia Manual",
      width: 5,
      render: (_, record) => (record.economyDayValueManual ? "Sim" : "Não"),
    },
    {
      title: "Motivo",
      width: 10,
      ellipsis: true,
      render: (_, record) => record.interventionReason,
    },
    {
      title: "Medicamento Origem",
      width: 10,
      ellipsis: true,
      render: (_, record) => record.originDrug,
    },
    {
      title: "Medicamento Substituto",
      width: 10,
      ellipsis: true,
      render: (_, record) => {
        if (record.economyType === 2) {
          return record.destinyDrug;
        }

        return "--";
      },
    },
    {
      title: "Responsável",
      width: 10,
      ellipsis: true,
      render: (_, record) => record.responsible,
    },
    {
      title: "Segmento",
      width: 10,
      ellipsis: true,
      render: (_, record) => record.segment,
    },
    {
      title: "Setor",
      width: 10,
      ellipsis: true,
      render: (_, record) => record.department,
    },
  ];

  return (
    <Table
      bordered
      virtual
      columns={columns}
      scroll={{
        x: 4000,
        y: 800,
      }}
      rowKey="idIntervention"
      dataSource={datasource.length === 0 ? [] : datasource}
      pagination={false}
    />
  );
}
