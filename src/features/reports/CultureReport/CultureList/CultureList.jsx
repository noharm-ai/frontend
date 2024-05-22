import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Descriptions } from "antd";
import DOMPurify from "dompurify";

import { formatDate } from "utils/date";
import { CardTable } from "components/Table";

export default function CultureList() {
  const [expandedRows, setExpandedRows] = useState([]);
  const datasource = useSelector(
    (state) => state.reportsArea.culture.filtered.result.list
  );

  const updateExpandedRows = (list, key) => {
    if (list.includes(key)) {
      return list.filter((i) => i !== key);
    }

    return [...list, key];
  };

  const handleRowExpand = (record) => {
    setExpandedRows(updateExpandedRows(expandedRows, record.id));
  };

  const toggleExpansion = () => {
    if (expandedRows.length) {
      setExpandedRows([]);
    } else {
      setExpandedRows(
        datasource.filter((i) => /^[0-9]*$/g.test(i.id)).map((i) => i.id)
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
      title: "Data Coleta",
      width: 150,
      sorter: (a, b) =>
        a.collectionDate < b.collectionDate
          ? -1
          : a.collectionDate > b.collectionDate
          ? 1
          : 0,
      render: (_, record) => formatDate(record.collectionDate),
    },
    {
      title: "Data Liberação",
      width: 160,
      sorter: (a, b) =>
        a.releaseDate < b.releaseDate
          ? -1
          : a.releaseDate > b.releaseDate
          ? 1
          : 0,
      render: (_, record) => formatDate(record.releaseDate),
    },
    {
      title: "Exame",
      ellipsis: true,
      render: (_, record) => record.examName,
    },
    {
      title: "Material",
      ellipsis: true,
      render: (_, record) => record.examMaterialName,
    },
    {
      title: "Resultado Prévio",
      ellipsis: true,
      render: (_, record) =>
        record.previousResult ? record.previousResult.split("<br>")[0] : "-",
    },
  ];

  return (
    <>
      <CardTable
        bordered
        columns={columns}
        rowKey="id"
        dataSource={datasource.length === 0 ? [] : datasource}
        footer={() => (
          <div style={{ textAlign: "center" }}>
            {datasource.length} registro(s)
          </div>
        )}
        expandable={{
          rowExpandable: (record) => record.cultures.length > 0,
          expandedRowRender: (record) => <ExpandedRow record={record} />,
          onExpand: (expanded, record) => handleRowExpand(record),
          expandedRowKeys: expandedRows,
        }}
        onRow={(record) => {
          return {
            onClick: (event) => {
              handleRowExpand(record);
            },
          };
        }}
        columnTitle={<ExpandColumn expand={!expandedRows.length} />}
        pagination={{ showSizeChanger: true }}
        size="small"
      />
    </>
  );
}

const ExpandedRow = ({ record }) => {
  const items = [];
  const hasValue = (value) => {
    return value !== null && `${value}`.trim() !== "";
  };

  if (record.previousResult) {
    items.push({
      label: "Resultado Prévio",
      span: 3,
      children: (
        <div
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(record.previousResult),
          }}
        ></div>
      ),
    });
  }

  if (hasValue(record.colony)) {
    items.push({
      label: "Descrição da Colônia",
      span: 3,
      children: record.colony || "-",
    });
  }

  if (hasValue(record.gram)) {
    items.push({
      label: "Bacterioscópico",
      span: 3,
      children: record.gram || "-",
    });
  }

  if (hasValue(record.extraInfo)) {
    items.push({
      label: "Complemento",
      span: 3,
      children: record.extraInfo || "-",
    });
  }

  items.push({
    label: "Microorganismo/Germe",
    span: 3,
    children:
      record.cultures.length > 0
        ? record.cultures[0].microorganism || "-"
        : "-",
  });

  items.push({
    label: "Resultado",
    span: 3,
    children: <DrugTable record={record} />,
  });

  return <Descriptions bordered items={items} />;
};

const DrugTable = ({ record }) => {
  const columns = [
    {
      title: "Medicamento",
      sorter: (a, b) => `${a?.drug}`.localeCompare(`${b?.drug}`),
      render: (_, record) => record.drug,
    },
    {
      title: "Sensibilidade",
      sorter: (a, b) => `${a?.result}`.localeCompare(`${b?.result}`),
      render: (_, record) => record.result,
    },
    {
      title: "MIC",
      render: (_, record) => record.microorganismAmount,
    },
  ];

  return (
    <CardTable
      bordered
      columns={columns}
      rowKey="drug"
      dataSource={record.cultures}
      pagination={false}
      size="small"
    />
  );
};
