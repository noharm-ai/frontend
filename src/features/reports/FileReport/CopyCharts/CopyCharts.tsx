import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Empty,
  Select,
  Space,
  Spin,
  Steps,
  Table,
  Tag,
  notification,
} from "antd";
import { useTranslation } from "react-i18next";

import Button from "src/components/Button";
import Modal from "src/components/Modal";
import { useAppDispatch } from "src/store";
import Permission from "src/models/Permission";
import PermissionService from "src/services/PermissionService";
import { getErrorMessage } from "src/utils/errorHandler";
import { fetchSwitchSchemaData } from "src/features/switchSchema/SwitchSchemaSlice";
import {
  getCopySourceGraphs,
  getCopySourceReports,
} from "src/features/reports/ReportsSlice";
import {
  ChartCopyAnalysis,
  ColumnMapping,
  classifyCharts,
  remapChart,
} from "src/components/ChartCreator/chartRemap";
import type { ChartConfig } from "src/components/ChartCreator/types";
import type { ColumnSchema } from "src/utils/dataFilters";

interface CopySourceReport {
  id: number;
  name: string;
  description: string;
  processedAt: string | null;
  graphCount: number;
}

interface CopyChartsProps {
  open: boolean;
  onClose: () => void;
  /** Columns of the report the charts are copied into. */
  targetSchema: ColumnSchema[];
  /** Titles already in use, so a copy never duplicates one. */
  existingTitles: string[];
  currentSchemaName: string;
  onImport: (charts: ChartConfig[], summary: CopySummary) => void;
}

export interface CopySummary {
  sourceSchema: string;
  sourceReportId: number;
  importedCount: number;
  excludedCount: number;
  mappedColumnCount: number;
}

/** Marker for "leave this column behind" in the mapping select. */
const SKIP = "__skip__";

export function CopyCharts({
  open,
  onClose,
  targetSchema,
  existingTitles,
  currentSchemaName,
  onImport,
}: CopyChartsProps) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const canPickSchema = PermissionService().has(Permission.MAINTAINER);

  const [stepIndex, setStepIndex] = useState(0);
  const [schemas, setSchemas] = useState<string[]>([]);
  const [sourceSchema, setSourceSchema] = useState(currentSchemaName);
  const [reports, setReports] = useState<CopySourceReport[]>([]);
  const [sourceReportId, setSourceReportId] = useState<number | null>(null);
  const [sourceCharts, setSourceCharts] = useState<ChartConfig[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [excluded, setExcluded] = useState<string[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [isLoadingCharts, setIsLoadingCharts] = useState(false);

  const targetKeys = useMemo(
    () => targetSchema.map((column) => column.key),
    [targetSchema],
  );

  const resetSource = () => {
    setSourceReportId(null);
    setSourceCharts([]);
    setMapping({});
    setExcluded([]);
  };

  useEffect(() => {
    if (!open) return;

    setStepIndex(0);
    setSourceSchema(currentSchemaName);
    resetSource();

    if (canPickSchema) {
      dispatch(fetchSwitchSchemaData({})).then((response: any) => {
        if (response.error) return;

        const list = response.payload?.data?.data?.schemas ?? [];
        setSchemas(list.map((schema: any) => schema.name));
      });
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;

    resetSource();
    setIsLoadingReports(true);

    dispatch(
      // @ts-expect-error legacy code
      getCopySourceReports({ sourceSchema }),
    ).then((response: any) => {
      setIsLoadingReports(false);

      if (response.error) {
        setReports([]);
        notifyError(response);
        return;
      }

      setReports(response.payload?.data?.data ?? []);
    });
  }, [open, sourceSchema]); // eslint-disable-line react-hooks/exhaustive-deps

  const notifyError = (response: any) => {
    notification.error({ message: getErrorMessage(response, t) });
  };

  const loadCharts = (idReport: number) => {
    setSourceReportId(idReport);
    setSourceCharts([]);
    setMapping({});
    setExcluded([]);
    setIsLoadingCharts(true);

    dispatch(
      // @ts-expect-error legacy code
      getCopySourceGraphs({ idReport, sourceSchema }),
    ).then(
      (response: any) => {
        setIsLoadingCharts(false);

        if (response.error) {
          notifyError(response);
          return;
        }

        setSourceCharts(response.payload?.data?.data?.graphs ?? []);
      },
    );
  };

  const analyses = useMemo(
    () => classifyCharts(sourceCharts, targetKeys),
    [sourceCharts, targetKeys],
  );

  const isExcluded = (analysis: ChartCopyAnalysis) =>
    analysis.exprParseError || excluded.includes(analysis.chart.id);

  const included = analyses.filter((analysis) => !isExcluded(analysis));

  // Only the columns still needed by a chart the user is actually importing.
  const missingColumns = useMemo(
    () =>
      Array.from(
        new Set(included.flatMap((analysis) => analysis.missing)),
      ).sort(),
    [included],
  );

  const isMapped = (column: string) => column in mapping;

  const pendingColumns = missingColumns.filter((column) => !isMapped(column));

  const mappedColumnCount = missingColumns.filter(
    (column) => mapping[column],
  ).length;

  /** Suggests destination columns, exact-ish name matches first. */
  const candidatesFor = (column: string) => {
    const normalize = (value: string) =>
      value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

    const wanted = normalize(column);

    return [...targetSchema]
      .sort((a, b) => {
        const scoreOf = (candidate: ColumnSchema) => {
          const key = normalize(candidate.key);
          if (key === wanted) return 0;
          if (key.includes(wanted) || wanted.includes(key)) return 1;
          return 2;
        };

        return scoreOf(a) - scoreOf(b) || a.key.localeCompare(b.key);
      })
      .map((candidate) => ({
        label: `${candidate.key} (${candidate.type})`,
        value: candidate.key,
      }));
  };

  const importable = useMemo(() => {
    const titles = [...existingTitles];

    return included.reduce<ChartConfig[]>((charts, analysis) => {
      const chart = remapChart(analysis.chart, mapping, targetSchema, titles);
      if (!chart) return charts;

      titles.push(chart.title);
      return [...charts, chart];
    }, []);
  }, [included, mapping, targetSchema, existingTitles]);

  const handleImport = () => {
    onImport(importable, {
      sourceSchema,
      sourceReportId: sourceReportId!,
      importedCount: importable.length,
      excludedCount: sourceCharts.length - importable.length,
      mappedColumnCount,
    });
    onClose();
  };

  const selectedReport = reports.find((report) => report.id === sourceReportId);

  const originStep = (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      {canPickSchema && (
        <div data-testid="copy-source-schema">
          <div className="modal-section-title">Schema de origem</div>
          <Select
            style={{ width: "100%" }}
            value={sourceSchema}
            onChange={setSourceSchema}
            showSearch
            optionFilterProp="label"
            options={(schemas.length > 0 ? schemas : [currentSchemaName]).map(
              (schema) => ({
                label:
                  schema === currentSchemaName ? `${schema} (atual)` : schema,
                value: schema,
              }),
            )}
          />
        </div>
      )}

      <div data-testid="copy-source-report">
        <div className="modal-section-title">Relatório de origem</div>
        <Select
          style={{ width: "100%" }}
          value={sourceReportId}
          onChange={loadCharts}
          loading={isLoadingReports}
          placeholder="Selecione o relatório de onde copiar os gráficos"
          showSearch
          optionFilterProp="label"
          notFoundContent={
            isLoadingReports ? <Spin size="small" /> : "Nenhum relatório"
          }
          options={reports.map((report) => ({
            label: `${report.name} — ${report.graphCount} gráfico(s)`,
            value: report.id,
            disabled: report.graphCount === 0,
          }))}
        />
      </div>

      {selectedReport && !selectedReport.processedAt && (
        <Alert
          type="warning"
          showIcon
          message="Este relatório ainda não foi processado. Os gráficos podem referenciar colunas que não existem mais."
        />
      )}

      {isLoadingCharts && <Spin />}

      {sourceReportId && !isLoadingCharts && sourceCharts.length === 0 && (
        <Empty description="Este relatório não tem gráficos para copiar." />
      )}
    </Space>
  );

  const columnsStep = (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      {missingColumns.length === 0 ? (
        <Alert
          type="success"
          showIcon
          message="Todas as colunas usadas pelos gráficos existem neste relatório."
        />
      ) : (
        <div>
          <div className="modal-section-title">
            Colunas sem equivalente neste relatório
          </div>
          <Table
            size="small"
            pagination={false}
            rowKey={(row: any) => row.column}
            dataSource={missingColumns.map((column) => ({ column }))}
            columns={[
              {
                title: "Coluna de origem",
                dataIndex: "column",
                width: "40%",
              },
              {
                title: "Coluna de destino",
                render: (_: any, row: any) => (
                  <Select
                    style={{ width: "100%" }}
                    value={
                      isMapped(row.column)
                        ? (mapping[row.column] ?? SKIP)
                        : undefined
                    }
                    onChange={(value) =>
                      setMapping((current) => ({
                        ...current,
                        [row.column]: value === SKIP ? null : value,
                      }))
                    }
                    placeholder="Escolha a coluna equivalente"
                    showSearch
                    optionFilterProp="label"
                    options={[
                      {
                        label: "Ignorar (remove os gráficos afetados)",
                        value: SKIP,
                      },
                      ...candidatesFor(row.column),
                    ]}
                  />
                ),
              },
            ]}
          />
        </div>
      )}

      <div>
        <div className="modal-section-title">Gráficos</div>
        <Table
          size="small"
          pagination={false}
          rowKey={(analysis: ChartCopyAnalysis) => analysis.chart.id}
          dataSource={analyses}
          rowSelection={{
            selectedRowKeys: included.map((analysis) => analysis.chart.id),
            onChange: (keys) =>
              setExcluded(
                analyses
                  .filter((analysis) => !keys.includes(analysis.chart.id))
                  .map((analysis) => analysis.chart.id),
              ),
            getCheckboxProps: (analysis: ChartCopyAnalysis) => ({
              disabled: analysis.exprParseError,
            }),
          }}
          columns={[
            {
              title: "Título",
              render: (_: any, analysis: ChartCopyAnalysis) =>
                analysis.chart.title || "(sem título)",
            },
            {
              title: "Situação",
              width: "45%",
              render: (_: any, analysis: ChartCopyAnalysis) => {
                if (analysis.exprParseError) {
                  return <Tag color="error">Fórmula inválida — não copiável</Tag>;
                }

                if (isExcluded(analysis)) {
                  return <Tag>Fora da cópia</Tag>;
                }

                const pending = analysis.missing.filter(
                  (column) => !isMapped(column),
                );

                if (pending.length > 0) {
                  return (
                    <Tag color="warning">
                      Aguardando: {pending.join(", ")}
                    </Tag>
                  );
                }

                const dropped = analysis.missing.filter(
                  (column) => !mapping[column],
                );

                if (dropped.length > 0) {
                  return (
                    <Tag color="default">
                      Será removido: {dropped.join(", ")} ignorada(s)
                    </Tag>
                  );
                }

                return <Tag color="success">Pronto</Tag>;
              },
            },
          ]}
        />
      </div>
    </Space>
  );

  const reviewStep = (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      <Alert
        type={importable.length > 0 ? "info" : "warning"}
        showIcon
        message={`${importable.length} gráfico(s) serão copiados; ${
          sourceCharts.length - importable.length
        } ficarão de fora.`}
        description={
          mappedColumnCount > 0
            ? `${mappedColumnCount} coluna(s) foram reaproveitadas em colunas deste relatório.`
            : undefined
        }
      />

      {importable.length > 0 && (
        <Table
          size="small"
          pagination={false}
          rowKey={(chart: ChartConfig) => chart.id}
          dataSource={importable}
          columns={[
            { title: "Título", dataIndex: "title" },
            { title: "Tipo", dataIndex: "type", width: 120 },
          ]}
        />
      )}

      <Alert
        type="info"
        showIcon
        message="Os gráficos são adicionados aos existentes. Use o botão salvar para gravá-los."
      />
    </Space>
  );

  const steps = [
    { title: "Origem", content: originStep, valid: sourceCharts.length > 0 },
    {
      title: "Colunas",
      content: columnsStep,
      valid: pendingColumns.length === 0 && importable.length > 0,
    },
    { title: "Revisão", content: reviewStep, valid: importable.length > 0 },
  ];

  const isLast = stepIndex === steps.length - 1;
  const current = steps[stepIndex];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title="Copiar gráficos de outro relatório"
      width={900}
      destroyOnHidden
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancelar
        </Button>,
        <Button
          key="back"
          disabled={stepIndex === 0}
          onClick={() => setStepIndex((index) => index - 1)}
        >
          Voltar
        </Button>,
        isLast ? (
          <Button
            key="import"
            type="primary"
            disabled={!current.valid}
            onClick={handleImport}
          >
            Copiar {importable.length} gráfico(s)
          </Button>
        ) : (
          <Button
            key="next"
            type="primary"
            disabled={!current.valid}
            onClick={() => setStepIndex((index) => index + 1)}
          >
            Próximo
          </Button>
        ),
      ]}
    >
      <Steps
        size="small"
        current={stepIndex}
        items={steps.map((step) => ({ title: step.title }))}
        style={{ margin: "16px 0 24px" }}
      />
      <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
        {current.content}
      </div>
    </Modal>
  );
}
