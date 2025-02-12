import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Descriptions } from "antd";

import { formatDateTime } from "utils/date";
import { CardTable } from "components/Table";
import Button from "components/Button";

export default function HistoryList() {
  const [expandedRows, setExpandedRows] = useState([]);
  const datasource = useSelector(
    (state) => state.reportsArea.antimicrobialHistory.filtered.result.list
  );

  const updateExpandedRows = (list, key) => {
    if (list.includes(key)) {
      return list.filter((i) => i !== key);
    }

    return [...list, key];
  };

  const handleRowExpand = (record) => {
    setExpandedRows(
      updateExpandedRows(expandedRows, record.idPrescriptionDrug)
    );
  };

  const toggleExpansion = () => {
    if (expandedRows.length) {
      setExpandedRows([]);
    } else {
      setExpandedRows(
        datasource
          .filter((i) => /^[0-9]*$/g.test(i.idPrescriptionDrug))
          .map((i) => i.idPrescriptionDrug)
      );
    }
  };

  const ExpandColumn = ({ expand }) => {
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <button
          type="button"
          className={`expand-all ant-table-row-expand-icon ${
            expand ? "ant-table-row-expand-icon-collapsed" : ""
          }`}
          onClick={toggleExpansion}
        ></button>
      </div>
    );
  };

  const columns = [
    {
      title: "Prescrito em",
      width: 160,
      sorter: (a, b) =>
        a.prescriptionDate < b.prescriptionDate
          ? -1
          : a.prescriptionDate > b.prescriptionDate
          ? 1
          : 0,
      render: (_, record) => formatDateTime(record.prescriptionDate),
    },
    {
      title: "Vigência",
      width: 160,
      sorter: (a, b) =>
        a.prescriptionExpirationDate < b.prescriptionExpirationDate
          ? -1
          : a.prescriptionExpirationDate > b.prescriptionExpirationDate
          ? 1
          : 0,
      render: (_, record) => formatDateTime(record.prescriptionExpirationDate),
    },
    {
      title: "Suspenso em",
      width: 160,
      sorter: (a, b) =>
        a.suspensionDate < b.suspensionDate
          ? -1
          : a.suspensionDate > b.suspensionDate
          ? 1
          : 0,
      render: (_, record) =>
        record.suspensionDate ? formatDateTime(record.suspensionDate) : "-",
    },
    {
      title: "Medicamento",
      render: (_, record) => record.drug,
    },
  ];

  return (
    <>
      <CardTable
        bordered
        columns={columns}
        rowKey="idPrescriptionDrug"
        dataSource={datasource.length === 0 ? [] : datasource}
        footer={() => (
          <div style={{ textAlign: "center" }}>
            {datasource.length} registro(s)
          </div>
        )}
        expandable={{
          expandedRowRender: (record) => <ExpandedRow record={record} />,
          onExpand: (expanded, record) => handleRowExpand(record),
          expandedRowKeys: expandedRows,
        }}
        onRow={(record) => {
          return {
            onClick: () => {
              handleRowExpand(record);
            },
          };
        }}
        columnTitle={<ExpandColumn expand={!expandedRows.length} />}
        size="small"
        pagination={{ showSizeChanger: true }}
      />
    </>
  );
}

const ExpandedRow = ({ record }) => {
  const items = [
    {
      label: "Atendimento",
      span: 3,
      children: record.admissionNumber,
    },
    {
      label: "Prescrição",
      span: 3,
      children: (
        <Button
          type="link"
          href={`/prescricao/${record.idPrescription}`}
          target="_blank"
        >
          {record.idPrescription}
        </Button>
      ),
    },
    {
      label: "Dose",
      children: `${record.dose} ${record.measureUnit || "-"}`,
    },
    {
      label: "Frequência",
      children: `${record.frequency || "-"}`,
    },
    {
      label: "Via",
      children: `${record.route || "-"}`,
    },
  ];

  return <Descriptions bordered items={items} size="small" />;
};
