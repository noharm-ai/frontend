import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Descriptions } from "antd";
import DOMPurify from "dompurify";

import { formatDate } from "utils/date";
import { CardTable } from "components/Table";
import Button from "components/Button";
import { stripHtmlPreserveSpaces } from "utils/stripHtml";

import { CultureResultContainer } from "../CultureReport.style";

const ExpandColumn = ({ expand, toggleExpansion }) => {
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

export default function CultureList() {
  const [expandedRows, setExpandedRows] = useState([]);
  const datasource = useSelector(
    (state) => state.reportsArea.culture.filtered.result.list,
  );

  const updateExpandedRows = (list, key) => {
    if (list.includes(key)) {
      return list.filter((i) => i !== key);
    }

    return [...list, key];
  };

  const handleRowExpand = (record) => {
    setExpandedRows(updateExpandedRows(expandedRows, record.key));
  };

  const toggleExpansion = () => {
    if (expandedRows.length) {
      setExpandedRows([]);
    } else {
      setExpandedRows(datasource.map((i) => i.key));
    }
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
      render: (_, record) => {
        return (
          <>
            {record.previousResult
              ? stripHtmlPreserveSpaces(record.previousResult.split("<br>")[0])
              : "-"}
          </>
        );
      },
    },
    {
      title: "Microorganismo",
      ellipsis: true,
      render: (_, record) =>
        record.microorganism ? record.microorganism : "-",
    },
  ];

  return (
    <>
      <CardTable
        bordered
        columns={columns}
        rowKey="key"
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
        columnTitle={
          <ExpandColumn
            expand={!expandedRows.length}
            toggleExpansion={toggleExpansion}
          />
        }
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
        <CultureResultContainer
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(record.previousResult),
          }}
        ></CultureResultContainer>
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

  if (record.predictions.length > 0) {
    items.push({
      label: "Predição",
      span: 3,
      children: <PredictionTable record={record} />,
    });
  }

  return <Descriptions bordered items={items} />;
};

const DrugTable = ({ record }) => {
  const cultures = record.cultures.filter((culture) => culture.result !== null);

  if (!record.cultures.length) {
    return "Resultado pendente";
  }

  if (cultures.length === 0) {
    return "Nenhum perfil de sensibilidade por medicamento encontrado";
  }

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
      dataSource={cultures}
      pagination={false}
      size="small"
    />
  );
};

const PredictionTable = ({ record }) => {
  const [show, setShow] = useState(false);

  const columns = [
    {
      title: "Medicamento",
      sorter: (a, b) => `${a?.drug}`.localeCompare(`${b?.drug}`),
      render: (_, record) => record.drug,
    },
    {
      title: "Sensibilidade",
      sorter: (a, b) => `${a?.result}`.localeCompare(`${b?.result}`),
      render: (_, record) =>
        record.prediction === "R" ? "Resistente" : "Sensível",
    },
    {
      title: "Acurácia",
      align: "right",
      render: (_, record) => `${record.probability * 100}%`,
    },
  ];

  if (!show) {
    return (
      <Button
        onClick={() => setShow(true)}
        style={{ background: "#a991d6", color: "#fff" }}
      >
        Exibir Predição de Resultados
      </Button>
    );
  }

  return (
    <CardTable
      bordered
      columns={columns}
      rowKey="drug"
      dataSource={record.predictions}
      pagination={false}
      size="small"
      className="ai-data"
    />
  );
};
