import { useState, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Spin, notification, FloatButton, Tag, Alert, Tabs } from "antd";
import { useParams } from "react-router-dom";
import {
  DeleteOutlined,
  PlusOutlined,
  MenuOutlined,
  DownloadOutlined,
  SyncOutlined,
  FileTextOutlined,
  FileExcelOutlined,
  SaveOutlined,
  TableOutlined,
  BarChartOutlined,
} from "@ant-design/icons";

import { useAppDispatch } from "src/store";
import { DataViewer } from "src/components/DataViewer/DataViewer";
import { formatDate } from "src/utils/date";
import { getFileReport } from "../ReportsSlice";
import Button from "src/components/Button";
import { FloatButtonGroup } from "src/components/FloatButton";
import {
  TrackedReport,
  trackReport,
  trackCustomReportAction,
  TrackedCustomReportAction,
} from "src/utils/tracker";
import {
  downloadReport,
  updateReportGraphs,
  suggestReportGraphs,
} from "src/features/reports/ReportsSlice";
import { getErrorMessage } from "src/utils/errorHandler";
import PermissionService from "src/services/PermissionService";
import Permission from "src/models/Permission";

import { PageHeader } from "src/styles/PageHeader.style";
import {
  FilterContainer,
  FilterActions,
  FilterList,
  ContentContainer,
} from "./FileReport.style";
import Modal from "src/components/Modal";
import { ChartCreator } from "src/components/ChartCreator/ChartCreator";
import { ChartConfig, ChartCreatorHandle } from "src/components/ChartCreator/types";
import {
  detectColumnSchema,
  applyFilters,
  ColumnSchema,
  Filter,
} from "./FileReport.utils";
import { FilterRow } from "./FilterRow";
import { ErrorBoundary } from "react-error-boundary";

const ChartCreatorFallback = ({
  resetErrorBoundary,
}: {
  resetErrorBoundary: () => void;
}) => (
  <Alert
    message="Erro nos gráficos"
    description="Ocorreu um erro ao renderizar os gráficos. Os dados do relatório não foram afetados."
    type="error"
    showIcon
    style={{ marginTop: "16px" }}
    action={
      <Button size="small" onClick={resetErrorBoundary}>
        Tentar novamente
      </Button>
    }
  />
);

const generateId = () => Math.random().toString(36).substr(2, 9);

export function FileReport() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { type, id_report, filename } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [title, setTitle] = useState<string>("");
  const [filters, setFilters] = useState<Filter[]>([]);
  const [schema, setSchema] = useState<ColumnSchema[]>([]);
  const [initialCharts, setInitialCharts] = useState<ChartConfig[]>([]);
  const [currentCharts, setCurrentCharts] = useState<ChartConfig[]>([]);
  const [isSavingCharts, setIsSavingCharts] = useState(false);
  const chartCreatorRef = useRef<ChartCreatorHandle>(null);
  const canWriteGraphs = PermissionService().has(
    Permission.WRITE_CUSTOM_REPORTS_GRAPHS,
  );
  const hasUnsavedChanges =
    JSON.stringify(currentCharts) !== JSON.stringify(initialCharts);

  // Charts tab is shown (and comes first) when the report has charts or the
  // user can create them; a viewer with no charts sees only the table.
  const showChartsTab = currentCharts.length > 0 || canWriteGraphs;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dispatch(
          /* @ts-expect-error legacy code */
          getFileReport({ type, id_report, filename: `${filename}.json.gz` }),
        );

        const cacheResponseStream = await fetch(response.payload.data.data.url);

        const cacheReadableStream = cacheResponseStream.body?.pipeThrough(
          new window.DecompressionStream("gzip"),
        );

        const decompressedResponse = new Response(cacheReadableStream);
        const cache = await decompressedResponse.json();

        setData(cache);
        setTitle(response.payload.data.data.title);
        if (response.payload.data.data.graphs) {
          try {
            const parsedCharts = JSON.parse(response.payload.data.data.graphs);
            setInitialCharts(parsedCharts);
            setCurrentCharts(parsedCharts);
          } catch {
            // ignore malformed JSON
          }
        }
      } catch (err) {
        console.error(err);
        notification.error({
          message: "Erro ao buscar relatório",
          description: "Não foi possível buscar o relatório.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [type, id_report, filename, dispatch]);

  useEffect(() => {
    if (data.length > 0) {
      const detectedSchema = detectColumnSchema(data);
      setSchema(detectedSchema);
    }
  }, [data]);

  const filteredData = useMemo(() => {
    return applyFilters(data, filters, schema);
  }, [data, filters, schema]);

  const addFilter = () => {
    setFilters([...filters, { id: generateId(), field: "", value: null }]);
    trackCustomReportAction(TrackedCustomReportAction.ADD_FILTER);
  };

  const removeFilter = (id: string) => {
    setFilters(filters.filter((f) => f.id !== id));
    trackCustomReportAction(TrackedCustomReportAction.REMOVE_FILTER);
  };

  const removeAllFilters = () => {
    setFilters([]);
    trackCustomReportAction(TrackedCustomReportAction.CLEAR_FILTERS);
  };

  const updateFilter = (
    id: string,
    field: string,
    value: any,
    mode?: "list" | "text",
  ) => {
    const updatedFilters = filters.map((f) => {
      if (f.id === id) {
        return { ...f, field, value, mode: mode || f.mode || "list" };
      }
      return f;
    });
    setFilters(updatedFilters);
  };

  const handleSaveCharts = () => {
    setIsSavingCharts(true);

    dispatch(
      // @ts-expect-error legacy code
      updateReportGraphs({
        idReport: id_report,
        graphs: JSON.stringify(currentCharts),
      }),
    ).then((response: any) => {
      if (response.error) {
        notification.error({ message: getErrorMessage(response, t) });
      } else {
        notification.success({ message: "Gráficos salvos com sucesso." });
        setInitialCharts(currentCharts);
      }
      setIsSavingCharts(false);
    });
  };

  // Core suggestion request, reused by both the bulk button and the wizard's
  // per-chart "Gerar com agente" step. Returns normalized ChartConfigs (or
  // throws on error). Defaults are applied first so a backend-provided `series`
  // (expression charts) is preserved by the trailing `...chart` spread.
  const requestChartSuggestions = async (
    hint: string,
  ): Promise<ChartConfig[]> => {
    const payload = {
      columns: schema.map(({ key, label, type: columnType, options }) => ({
        key,
        label,
        type: columnType,
        options: options?.slice(0, 20),
        distinctCount: options?.length,
      })),
      sampleRows: filteredData.slice(0, 5).map((row) => {
        const truncatedRow: Record<string, any> = {};
        Object.entries(row).forEach(([key, value]) => {
          truncatedRow[key] =
            typeof value === "string" && value.length > 120
              ? value.slice(0, 120)
              : value;
        });
        return truncatedRow;
      }),
      hint: hint || undefined,
      existingTitles: currentCharts.map((c) => c.title),
    };

    const response: any = await dispatch(
      // @ts-expect-error legacy code
      suggestReportGraphs(payload),
    );

    if (response.error) {
      throw new Error(getErrorMessage(response, t));
    }

    const suggestions: ChartConfig[] = response.payload.data.data ?? [];
    return suggestions.map((chart) => ({
      aggregation: "none",
      sortOrder: "none",
      xSortOrder: "none",
      xLabelRotate: 0,
      topN: 0,
      showLabels: false,
      height: 400,
      dateGrouping: "none",
      showTitle: true,
      colorPalette: "default",
      stacked: false,
      filters: [],
      ...chart,
      id: generateId(),
      // The agent may return expression series without ids; the builder and
      // renderer key each series by id, so ensure every one has a stable one.
      ...(chart.series
        ? { series: chart.series.map((s) => ({ ...s, id: s.id || generateId() })) }
        : {}),
    }));
  };

  const executeDownloadWithFormat = (
    filename: string,
    format: "csv" | "xlsx",
  ) => {
    setIsExporting(true);
    trackReport(TrackedReport.CUSTOM, {
      title: `exportar: ${title} - ${format}`,
    });

    const formatExtension = format === "csv" ? ".csv" : ".xlsx";
    const formattedFilename = filename.includes(".")
      ? filename.replace(/\.[^/.]+$/, formatExtension)
      : filename + formatExtension;

    const payload = {
      idReport: id_report,
      filename: formattedFilename,
    };

    // @ts-expect-error ts 2554 (legacy code)
    dispatch(downloadReport(payload)).then((response: any) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        if (response.payload.data.data.url) {
          window.open(response.payload.data.data.url);
        }
      }

      setIsExporting(false);
      setShowExportModal(false);
    });
  };

  return (
    <>
      <Spin spinning={isLoading}>
        <PageHeader>
          <div>
            <h1 className="page-header-title">Relatório: {title}</h1>
            <div className="page-header-legend">
              Data de geração: {formatDate(filename)}
            </div>
          </div>
          <div className="page-header-actions"></div>
        </PageHeader>
        <div style={{ padding: "1rem" }}>
          <FilterContainer>
            <FilterList>
              {filters.length === 0 && (
                <div
                  style={{
                    color: "#999",
                    fontStyle: "italic",
                    textAlign: "center",
                    padding: "10px",
                  }}
                >
                  Nenhum filtro aplicado. Clique em "Adicionar filtro" para
                  começar.
                </div>
              )}
              {filters.map((filter) => (
                <FilterRow
                  key={filter.id}
                  id={filter.id}
                  field={filter.field}
                  value={filter.value}
                  mode={filter.mode}
                  schema={schema}
                  onChange={updateFilter}
                  onRemove={removeFilter}
                />
              ))}
            </FilterList>
            <FilterActions>
              <Button
                icon={<PlusOutlined />}
                onClick={addFilter}
                type="primary"
                ghost
              >
                Adicionar filtro
              </Button>
              <Button
                icon={<DeleteOutlined />}
                danger
                onClick={removeAllFilters}
              >
                Limpar
              </Button>
            </FilterActions>
          </FilterContainer>

          <ContentContainer>
          <Tabs
            // Remount when the tab set changes (e.g. charts load) so the
            // correct default tab (Gráficos first when present) takes effect.
            key={showChartsTab ? "with-charts" : "table-only"}
            defaultActiveKey={showChartsTab ? "charts" : "table"}
            items={[
              ...(showChartsTab
                ? [
                    {
                      key: "charts",
                      label: (
                        <span>
                          <BarChartOutlined /> Gráficos
                        </span>
                      ),
                      children:
                        filteredData && filteredData.length > 0 ? (
                          <ErrorBoundary FallbackComponent={ChartCreatorFallback}>
                            <ChartCreator
                              ref={chartCreatorRef}
                              data={filteredData}
                              initialCharts={initialCharts}
                              onChartsChange={setCurrentCharts}
                              readOnly={!canWriteGraphs}
                              onGenerateCharts={requestChartSuggestions}
                            />

                            {canWriteGraphs && (
                              <Alert
                                type="info"
                                showIcon
                                description="A visualização de gráficos está disponível para todos, mas a adição e edição são restritas a usuários com permissão específica."
                                style={{ maxWidth: "500px", margin: "2rem auto" }}
                              />
                            )}
                          </ErrorBoundary>
                        ) : (
                          <Alert
                            type="info"
                            showIcon
                            message="Sem dados para gerar gráficos com os filtros atuais."
                          />
                        ),
                    },
                  ]
                : []),
              {
                key: "table",
                label: (
                  <span>
                    <TableOutlined /> Tabela
                  </span>
                ),
                children: (
                  <DataViewer
                    data={filteredData}
                    onRowClick={() => {}}
                    showFilters={false}
                  />
                ),
              },
            ]}
          />
          </ContentContainer>
        </div>
      </Spin>

      {!isLoading && (
        <FloatButtonGroup
          trigger="click"
          type="primary"
          icon={<MenuOutlined />}
          tooltip={{
            title: "Menu",
            placement: "left",
          }}
          style={{ bottom: 25 }}
        >
          <FloatButton
            icon={
              isExporting ? <SyncOutlined spin={true} /> : <DownloadOutlined />
            }
            tooltip={{
              title: "Exportar",
              placement: "left",
            }}
            onClick={() => setShowExportModal(true)}
          />
        </FloatButtonGroup>
      )}
      <Modal
        title="Escolha o formato de exportação"
        open={showExportModal}
        onCancel={() => setShowExportModal(false)}
        footer={null}
        destroyOnHidden
        width={400}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "20px",
            padding: "20px 0",
          }}
        >
          <Button
            size="large"
            icon={<FileTextOutlined />}
            onClick={() => executeDownloadWithFormat(filename!, "csv")}
            loading={isExporting}
          >
            CSV
          </Button>
          <Button
            size="large"
            type="primary"
            icon={<FileExcelOutlined />}
            onClick={() => executeDownloadWithFormat(filename!, "xlsx")}
            loading={isExporting}
          >
            XLSX
          </Button>
        </div>
        <p>
          *Os filtros não são aplicados no arquivo exportado. Ele sempre possui
          os dados completos.
        </p>
      </Modal>
      {!isLoading && filteredData.length > 0 && canWriteGraphs && (
        <>
          {hasUnsavedChanges && (
            <div
              style={{
                position: "fixed",
                bottom: 94,
                right: 70,
                zIndex: 1000,
              }}
            >
              <Tag color="warning">Alterações não salvas</Tag>
            </div>
          )}
          <FloatButton
            icon={isSavingCharts ? <SyncOutlined spin /> : <SaveOutlined />}
            tooltip={{ title: "Salvar gráficos", placement: "left" }}
            style={{
              bottom: 85,
              right: 24,
              ...(hasUnsavedChanges
                ? ({
                    background: "#faad14",
                    color: "#fff",
                  } as object)
                : {}),
            }}
            onClick={handleSaveCharts}
          />
        </>
      )}
      <FloatButton.BackTop
        style={{ right: 80, bottom: 25 }}
        tooltip="Voltar ao topo"
      />
    </>
  );
}
