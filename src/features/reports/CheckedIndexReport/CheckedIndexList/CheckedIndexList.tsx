import { useSelector } from "react-redux";
import { Tag, Space } from "antd";

import { formatDateTime } from "utils/date";
import Table from "components/Table";
import Tooltip from "components/Tooltip";
import PermissionService from "services/PermissionService";
import Permission from "src/models/Permission";
import { translateFrequencyDay } from "utils/index";

export default function CheckedIndexList() {
  const datasource = useSelector(
    (state: any) => state.reportsArea.checkedIndex.filtered.result.list,
  );

  const columns: any[] = [
    {
      title: "Dose",
      dataIndex: "dose",
      width: 120,
      align: "right" as const,
      sorter: (a: any, b: any) => a.dose - b.dose,
      onCell: (record: any) => ({
        style: record.matchDiff?.includes("dose")
          ? { backgroundColor: "#ff4d4f33" }
          : {},
      }),
      render: (_: any, record: any) =>
        record.dose != null ? record.dose : "-",
    },
    {
      title: "Freq./Dia",
      dataIndex: "frequencyDay",
      width: 120,
      align: "right" as const,
      sorter: (a: any, b: any) => a.frequencyDay - b.frequencyDay,
      onCell: (record: any) => ({
        style: record.matchDiff?.includes("frequenciadia")
          ? { backgroundColor: "#ff4d4f33" }
          : {},
      }),
      render: (_: any, record: any) =>
        record.frequencyDay != null
          ? translateFrequencyDay(record.frequencyDay)
          : "-",
    },
    {
      title: "Via",
      width: 120,
      sorter: (a: any, b: any) =>
        a.route < b.route ? -1 : a.route > b.route ? 1 : 0,
      onCell: (record: any) => ({
        style: record.matchDiff?.includes("via")
          ? { backgroundColor: "#ff4d4f33" }
          : {},
      }),
      render: (_: any, record: any) =>
        record.route != null ? record.route : "-",
    },
    {
      title: "Horário",
      width: 120,
      sorter: (a: any, b: any) =>
        a.interval < b.interval ? -1 : a.interval > b.interval ? 1 : 0,
      onCell: (record: any) => ({
        style: record.matchDiff?.includes("horario")
          ? { backgroundColor: "#ff4d4f33" }
          : {},
      }),
      render: (_: any, record: any) =>
        record.interval != null ? record.interval : "-",
    },
    {
      title: "Prescrição",
      dataIndex: "idPrescription",
      width: 140,
      sorter: (a: any, b: any) =>
        a.idPrescription < b.idPrescription
          ? -1
          : a.idPrescription > b.idPrescription
            ? 1
            : 0,
      render: (_: any, record: any) =>
        record.idPrescription ? record.idPrescription : "-",
    },
    {
      title: "Data prescrição",
      width: 160,
      sorter: (a: any, b: any) =>
        a.prescriptionDate < b.prescriptionDate
          ? -1
          : a.prescriptionDate > b.prescriptionDate
            ? 1
            : 0,
      render: (_: any, record: any) => formatDateTime(record.prescriptionDate),
    },
    {
      title: "Checado por",
      width: 200,
      sorter: (a: any, b: any) =>
        a.createdBy < b.createdBy ? -1 : a.createdBy > b.createdBy ? 1 : 0,
      render: (_: any, record: any) =>
        record.createdBy ? record.createdBy : "-",
    },
    {
      title: "Checado em",
      width: 160,
      sorter: (a: any, b: any) =>
        a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0,
      render: (_: any, record: any) => formatDateTime(record.createdAt),
    },
  ];

  if (PermissionService().has(Permission.MAINTAINER)) {
    columns.push({
      title: (
        <Tooltip title="Campos que não estão iguais entre a prescrição e a checagem">
          Campos diff
        </Tooltip>
      ),
      dataIndex: "matchDiff",
      width: 160,
      render: (_: any, record: any) => {
        if (record.matchDiff.length === 0) {
          return "-";
        }

        return (
          <Space>
            {record.matchDiff.map((d: any) => (
              <Tag>{d}</Tag>
            ))}
          </Space>
        );
      },
    });
  }

  return (
    <>
      <Table
        bordered
        columns={columns}
        rowKey={(row: any) => `${row.idPrescription}-${row.createdAt}`}
        dataSource={datasource.length === 0 ? [] : datasource}
        footer={() => (
          <div style={{ textAlign: "center" }}>
            {datasource.length} registro(s)
          </div>
        )}
        size="small"
        pagination={{ showSizeChanger: true }}
      />
    </>
  );
}
