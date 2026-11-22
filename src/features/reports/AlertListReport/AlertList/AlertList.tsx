import { useState, type ComponentType, type MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { Descriptions, Alert } from "antd";
import type { DescriptionsProps, TableProps } from "antd";

import { useAppSelector } from "src/store";
import { CardTable } from "components/Table";
import DrugAlertLevelTag from "components/DrugAlertLevelTag";
import RichTextView from "components/RichTextView";
import { formatDateTime } from "utils/date";
import type { AlertListItem } from "../transformers";

// CardTable is styled(antd Table), which drops the Table's record type
const AlertsTable = CardTable as unknown as ComponentType<
  TableProps<AlertListItem>
>;

interface ExpandColumnProps {
  expand: boolean;
  toggleExpansion: (event: MouseEvent<HTMLButtonElement>) => void;
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

export function AlertList() {
  const { t } = useTranslation();
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const datasource = useAppSelector(
    (state) => state.reportsArea.alertList.filtered.result.list,
  );

  const updateExpandedRows = (list: string[], key: string) => {
    if (list.includes(key)) {
      return list.filter((i) => i !== key);
    }

    return [...list, key];
  };

  const handleRowExpand = (record: AlertListItem) => {
    setExpandedRows(updateExpandedRows(expandedRows, record.rowKey));
  };

  // a search can drop rows that were open: only the rows still listed count
  const hasExpandedRows = datasource.some((i) =>
    expandedRows.includes(i.rowKey),
  );

  const toggleExpansion = () => {
    if (hasExpandedRows) {
      setExpandedRows([]);
    } else {
      setExpandedRows(datasource.map((i) => i.rowKey));
    }
  };

  const columns: TableProps<AlertListItem>["columns"] = [
    {
      title: "Nível",
      align: "center",
      render: (_: unknown, record: AlertListItem) => {
        return (
          <DrugAlertLevelTag
            levels={[record.level]}
            count={record.level}
            showDescription
            showTooltip={false}
          />
        );
      },
    },
    {
      title: "Medicamento",
      render: (_: unknown, record: AlertListItem) => record.drugName,
    },

    {
      title: "Tipo",
      render: (_: unknown, record: AlertListItem) =>
        t(`drugAlertType.${record.type}`),
    },
  ];

  return (
    <>
      <AlertsTable
        bordered
        columns={columns}
        rowKey="rowKey"
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
          // the expand-all header; it used to be a top-level Table prop, which
          // rc-table merges into expandable all the same
          columnTitle: (
            <ExpandColumn
              expand={!hasExpandedRows}
              toggleExpansion={toggleExpansion}
            />
          ),
        }}
        onRow={(record) => {
          return {
            onClick: () => {
              handleRowExpand(record);
            },
          };
        }}
        size="small"
        pagination={{ showSizeChanger: true }}
      />
    </>
  );
}

interface ExpandedRowProps {
  record: AlertListItem;
}

const ExpandedRow = ({ record }: ExpandedRowProps) => {
  let items: DescriptionsProps["items"];
  if (record.type === "protocolGeneral") {
    items = [
      {
        label: "Vigência",
        span: 3,
        children: `${
          record.expire
            ? formatDateTime(record.expire)
            : "Manter até segunda ordem"
        }`,
      },
      {
        label: "Alerta",
        span: 3,
        children: (
          <Alert
            type="error"
            message={<RichTextView text={record.text} maxWidth={undefined} />}
            showIcon
          />
        ),
      },
    ];
  } else {
    items = [
      {
        label: "Dose",
        span: 3,
        children: `${record.dose} ${record.measureUnit?.label || "-"}`,
      },
      {
        label: "Frequência",
        span: 3,
        children: `${record.frequency?.label || "-"}`,
      },
      {
        label: "Via",
        span: 3,
        children: `${record.route || "-"}`,
      },
      {
        label: "Vigência",
        span: 3,
        children: `${
          record.expire
            ? formatDateTime(record.expire)
            : "Manter até segunda ordem"
        }`,
      },
      {
        label: "Alerta",
        span: 3,
        children: (
          <Alert
            type="error"
            message={<RichTextView text={record.text} maxWidth={undefined} />}
            showIcon
          />
        ),
      },
    ];
  }

  return <Descriptions bordered items={items} size="small" />;
};
