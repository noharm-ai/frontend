import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Descriptions, Alert } from "antd";

import { CardTable } from "components/Table";
import DrugAlertLevelTag from "components/DrugAlertLevelTag";
import RichTextView from "components/RichTextView";
import { formatDateTime } from "utils/date";

export default function AlertList() {
  const { t } = useTranslation();
  const [expandedRows, setExpandedRows] = useState([]);
  const datasource = useSelector(
    (state) => state.reportsArea.alertList.filtered.result.list
  );

  const updateExpandedRows = (list, key) => {
    if (list.includes(key)) {
      return list.filter((i) => i !== key);
    }

    return [...list, key];
  };

  const handleRowExpand = (record) => {
    setExpandedRows(updateExpandedRows(expandedRows, record.rowKey));
  };

  const toggleExpansion = () => {
    if (expandedRows.length) {
      setExpandedRows([]);
    } else {
      setExpandedRows(datasource.map((i) => i.rowKey));
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
      title: "Nível",
      align: "center",
      render: (_, record) => {
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
      render: (_, record) => record.drugName,
    },

    {
      title: "Tipo",
      render: (_, record) => t(`drugAlertType.${record.type}`),
    },
  ];

  return (
    <>
      <CardTable
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
  let items = [];
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
            message={<RichTextView text={record.text} />}
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
            message={<RichTextView text={record.text} />}
            showIcon
          />
        ),
      },
    ];
  }

  return <Descriptions bordered items={items} size="small" />;
};
