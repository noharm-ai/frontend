import { useState, type ComponentType, type ReactNode } from "react";
import { Descriptions, type DescriptionsProps, type TableProps } from "antd";
import DOMPurify from "dompurify";

import { useAppSelector } from "src/store";
import { formatDate } from "utils/date";
import { CardTable } from "components/Table";
import Button from "components/Button";
import { stripHtmlPreserveSpaces } from "utils/stripHtml";
import type {
  CultureReportItem,
  CultureReportDrug,
  CultureReportPrediction,
} from "../transformers";

import { CultureResultContainer } from "../CultureReport.style";

type RowKey = CultureReportItem["key"];

// CardTable is styled(antd Table), which drops the Table's record type; the
// expand-all header (columnTitle) is not part of antd's TableProps either
const CultureTable = CardTable as unknown as ComponentType<
  TableProps<CultureReportItem> & { columnTitle?: ReactNode }
>;
// a drug can repeat (or be null) within a collection, so the sub-tables key
// their rows by position
type DrugRow = CultureReportDrug & { rowIndex: number };
type PredictionRow = CultureReportPrediction & { rowIndex: number };

const DrugResultTable = CardTable as unknown as ComponentType<
  TableProps<DrugRow>
>;
const PredictionResultTable = CardTable as unknown as ComponentType<
  TableProps<PredictionRow>
>;

// only an explicit R or S is a prediction: anything else is not a result
const PREDICTION_LABELS: Record<string, string> = {
  R: "Resistente",
  S: "Sensível",
};

// the dates are ISO strings; compared as the JS did, a missing one included
const compareDates = (a?: string | null, b?: string | null) =>
  (a as string) < (b as string) ? -1 : (a as string) > (b as string) ? 1 : 0;

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

export function CultureList() {
  const [expandedRows, setExpandedRows] = useState<RowKey[]>([]);
  const datasource = useAppSelector(
    (state) => state.reportsArea.culture.filtered.result.list,
  );

  const updateExpandedRows = (list: RowKey[], key: RowKey): RowKey[] => {
    if (list.includes(key)) {
      return list.filter((i) => i !== key);
    }

    return [...list, key];
  };

  const handleRowExpand = (record: CultureReportItem) => {
    setExpandedRows(updateExpandedRows(expandedRows, record.key));
  };

  const toggleExpansion = () => {
    if (expandedRows.length) {
      setExpandedRows([]);
    } else {
      setExpandedRows(datasource.map((i) => i.key));
    }
  };

  const columns: TableProps<CultureReportItem>["columns"] = [
    {
      title: "Data Coleta",
      width: 150,
      sorter: (a, b) => compareDates(a.collectionDate, b.collectionDate),
      render: (_, record) => formatDate(record.collectionDate),
    },
    {
      title: "Data Liberação",
      width: 160,
      sorter: (a, b) => compareDates(a.releaseDate, b.releaseDate),
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
      <CultureTable
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
        pagination={{ showSizeChanger: true }}
        size="small"
      />
    </>
  );
}

interface RecordProps {
  record: CultureReportItem;
}

const ExpandedRow = ({ record }: RecordProps) => {
  const items: NonNullable<DescriptionsProps["items"]> = [];
  const hasValue = (value: unknown) => {
    return value != null && `${value}`.trim() !== "";
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

const DrugTable = ({ record }: RecordProps) => {
  const cultures: DrugRow[] = record.cultures
    .filter((culture) => culture.result !== null)
    .map((culture, rowIndex) => ({ ...culture, rowIndex }));

  if (!record.cultures.length) {
    return "Resultado pendente";
  }

  if (cultures.length === 0) {
    return "Nenhum perfil de sensibilidade por medicamento encontrado";
  }

  const columns: TableProps<DrugRow>["columns"] = [
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
    <DrugResultTable
      bordered
      columns={columns}
      rowKey="rowIndex"
      dataSource={cultures}
      pagination={false}
      size="small"
    />
  );
};

const PredictionTable = ({ record }: RecordProps) => {
  const [show, setShow] = useState(false);

  const predictions: PredictionRow[] = record.predictions.map(
    (prediction, rowIndex) => ({ ...prediction, rowIndex }),
  );

  const columns: TableProps<PredictionRow>["columns"] = [
    {
      title: "Medicamento",
      sorter: (a, b) => `${a?.drug}`.localeCompare(`${b?.drug}`),
      render: (_, record) => record.drug,
    },
    {
      title: "Sensibilidade",
      sorter: (a, b) => `${a?.prediction}`.localeCompare(`${b?.prediction}`),
      render: (_, record) => PREDICTION_LABELS[record.prediction ?? ""] ?? "-",
    },
    {
      title: "Acurácia",
      align: "right",
      render: (_, record) => `${Math.round(record.probability * 100)}%`,
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
    <PredictionResultTable
      bordered
      columns={columns}
      rowKey="rowIndex"
      dataSource={predictions}
      pagination={false}
      size="small"
      className="ai-data"
    />
  );
};
