import { useState, type ComponentType, type ReactNode } from "react";
import { Descriptions, type DescriptionsProps, type TableProps } from "antd";

import { useAppSelector } from "src/store";
import { formatDateTime } from "utils/date";
import { CardTable } from "components/Table";
import Button from "components/Button";
import type { DrugHistoryItem } from "../transformers";

type RowKey = DrugHistoryItem["idPrescriptionDrug"];

// CardTable is styled(antd Table), which drops the Table's record type; the
// expand-all header (columnTitle) is not part of antd's TableProps either
const HistoryTable = CardTable as unknown as ComponentType<
  TableProps<DrugHistoryItem> & { columnTitle?: ReactNode }
>;

interface ExpandColumnProps {
  expand: boolean;
  toggleExpansion: () => void;
}

const ExpandColumn = ({ expand, toggleExpansion }: ExpandColumnProps) => {
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

export function HistoryList() {
  const [expandedRows, setExpandedRows] = useState<RowKey[]>([]);
  const datasource = useAppSelector(
    (state) => state.reportsArea.drugHistory.filtered.result.list,
  );

  const updateExpandedRows = (list: RowKey[], key: RowKey): RowKey[] => {
    if (list.includes(key)) {
      return list.filter((i) => i !== key);
    }

    return [...list, key];
  };

  const handleRowExpand = (record: DrugHistoryItem) => {
    setExpandedRows(
      updateExpandedRows(expandedRows, record.idPrescriptionDrug),
    );
  };

  const toggleExpansion = () => {
    if (expandedRows.length) {
      setExpandedRows([]);
    } else {
      setExpandedRows(
        datasource
          .filter((i) => /^[0-9]*$/g.test(String(i.idPrescriptionDrug)))
          .map((i) => i.idPrescriptionDrug),
      );
    }
  };

  const columns: TableProps<DrugHistoryItem>["columns"] = [
    {
      title: "Prescrito em",
      width: 160,
      sorter: (a: DrugHistoryItem, b: DrugHistoryItem) =>
        a.prescriptionDate < b.prescriptionDate
          ? -1
          : a.prescriptionDate > b.prescriptionDate
            ? 1
            : 0,
      render: (_: unknown, record: DrugHistoryItem) =>
        formatDateTime(record.prescriptionDate),
    },
    {
      title: "Vigência",
      width: 160,
      sorter: (a: DrugHistoryItem, b: DrugHistoryItem) =>
        (a.prescriptionExpirationDate as string) <
        (b.prescriptionExpirationDate as string)
          ? -1
          : (a.prescriptionExpirationDate as string) >
              (b.prescriptionExpirationDate as string)
            ? 1
            : 0,
      render: (_: unknown, record: DrugHistoryItem) =>
        formatDateTime(record.prescriptionExpirationDate),
    },
    {
      title: "Suspenso em",
      width: 160,
      sorter: (a: DrugHistoryItem, b: DrugHistoryItem) =>
        // null dates compare as neither earlier nor later, as before
        (a.suspensionDate as string) < (b.suspensionDate as string)
          ? -1
          : (a.suspensionDate as string) > (b.suspensionDate as string)
            ? 1
            : 0,
      render: (_: unknown, record: DrugHistoryItem) =>
        record.suspensionDate ? formatDateTime(record.suspensionDate) : "-",
    },
    {
      title: "Medicamento",
      render: (_: unknown, record: DrugHistoryItem) => record.drug,
    },
  ];

  return (
    <>
      <HistoryTable
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
          onExpand: (_expanded, record) => handleRowExpand(record),
          expandedRowKeys: expandedRows,
        }}
        onRow={(record) => {
          return {
            onClick: () => {
              handleRowExpand(record);
            },
          };
        }}
        columnTitle={
          <ExpandColumn
            expand={!expandedRows.length}
            toggleExpansion={toggleExpansion}
          />
        }
        size="small"
        pagination={{ showSizeChanger: true }}
      />
    </>
  );
}

const ExpandedRow = ({ record }: { record: DrugHistoryItem }) => {
  const items: DescriptionsProps["items"] = [
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
