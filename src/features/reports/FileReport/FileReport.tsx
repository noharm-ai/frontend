import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Spin,
  notification,
  FloatButton,
  Tag,
  Alert,
  Tabs,
} from "antd";
import { useParams } from "react-router-dom";
import {
  DeleteOutlined,
  PlusOutlined,
  MenuOutlined,
  DownloadOutlined,
  SyncOutlined,
  SaveOutlined,
  TableOutlined,
  BarChartOutlined,
  CopyOutlined,
} from "@ant-design/icons";

import { useAppDispatch, useAppSelector } from "src/store";
import { DataViewer } from "src/components/DataViewer/DataViewer";
import { formatDate } from "src/utils/date";
import { getFileReport } from "../ReportsSlice";
import Button from "src/components/Button";
import { FloatButtonGroup } from "src/components/FloatButton";
import {
  trackCustomReportAction,
  TrackedCustomReportAction,
} from "src/utils/tracker";
import {
  updateReportGraphs,
  suggestReportGraphs,
} from "src/features/reports/ReportsSlice";
import { getErrorMessage } from "src/utils/errorHandler";
import PermissionService from "src/services/PermissionService";
import Permission from "src/models/Permission";
import { FeatureService } from "src/services/FeatureService";
import Feature from "src/models/Feature";

import { PageHeader } from "src/styles/PageHeader.style";
import {
  FilterContainer,
  FilterActions,
  FilterList,
  ContentContainer,
} from "./FileReport.style";
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
import { withChartDefaults } from "src/components/ChartCreator/chartRemap";
import { CopyCharts, CopySummary } from "./CopyCharts/CopyCharts";
import { LoadPatientNames } from "./LoadPatientNames/LoadPatientNames";
import { ExportNames, ExportReport } from "./ExportReport/ExportReport";
import {
  collectDistinctPatientIds,
  enrichRowsWithNames,
  findPatientIdColumn,
  PatientNames,
  resolveNameColumnKey,
} from "./patientNames/patientNames.utils";
import { LoadResult } from "./patientNames/loadPatientNames";
import { ReportNames } from "./patientNames/usePatientNamesLoad";

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
  const [showCopyCharts, setShowCopyCharts] = useState(false);
  // Patient names live only in this page, never in the shared name cache.
  // They are loaded on demand ("Carregar nomes" or an export with names) and
  // written into the rows, so the table, sorting and filters use them.
  const [patientNames, setPatientNames] = useState<PatientNames>({});
  const [notFoundIds, setNotFoundIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const chartCreatorRef = useRef<ChartCreatorHandle>(null);
  const currentSchema = useAppSelector(
    (state: any) => state.user.account.schema,
  );
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

        setPatientNames({});
        setNotFoundIds(new Set());
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

  // Patient names are offered only when the report has a patient id column
  // and name lookup is enabled for the session.
  const canLoadPatientNames =
    !FeatureService.has(Feature.DISABLE_GETNAME) &&
    !FeatureService.has(Feature.HIDE_NAMES);
  const patientIdKey = useMemo(
    () => (canLoadPatientNames ? findPatientIdColumn(data[0]) : null),
    [data, canLoadPatientNames],
  );
  const nameColumnKey = useMemo(
    () =>
      patientIdKey ? resolveNameColumnKey(Object.keys(data[0] ?? {})) : null,
    [data, patientIdKey],
  );
  const patientIds = useMemo(
    () => (patientIdKey ? collectDistinctPatientIds(data, patientIdKey) : []),
    [data, patientIdKey],
  );
  // the name column shows up once a load has answered some patient
  const hasNameAnswers =
    Object.keys(patientNames).length > 0 || notFoundIds.size > 0;
  const enrichedData = useMemo(
    () =>
      hasNameAnswers && patientIdKey && nameColumnKey
        ? enrichRowsWithNames(data, patientIdKey, nameColumnKey, patientNames)
        : data,
    [data, hasNameAnswers, patientIdKey, nameColumnKey, patientNames],
  );

  const handleNamesLoaded = useCallback((result: LoadResult) => {
    if (Object.keys(result.names).length > 0) {
      setPatientNames((current) => ({ ...current, ...result.names }));
    }
    if (result.notFound.length > 0) {
      setNotFoundIds((current) => new Set([...current, ...result.notFound]));
    }
  }, []);

  const reportNames = useMemo<ReportNames | null>(
    () =>
      nameColumnKey && patientIds.length > 0
        ? {
            ids: patientIds,
            known: patientNames,
            notFound: notFoundIds,
            onLoaded: handleNamesLoaded,
          }
        : null,
    [nameColumnKey, patientIds, patientNames, notFoundIds, handleNamesLoaded],
  );

  useEffect(() => {
    if (enrichedData.length > 0) {
      const detectedSchema = detectColumnSchema(enrichedData);
      setSchema(detectedSchema);
    }
  }, [enrichedData]);

  const filteredData = useMemo(() => {
    return applyFilters(enrichedData, filters, schema);
  }, [enrichedData, filters, schema]);

  // The name column stays out of everything charts touch: saved charts are
  // shared and persisted, and chart suggestions are generated by an LLM.
  const chartExcludeKeys = useMemo(
    () => (nameColumnKey ? [nameColumnKey] : []),
    [nameColumnKey],
  );
  const chartSchema = useMemo(
    () =>
      nameColumnKey ? schema.filter((c) => c.key !== nameColumnKey) : schema,
    [schema, nameColumnKey],
  );

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
    exclude?: boolean,
  ) => {
    const updatedFilters = filters.map((f) => {
      if (f.id === id) {
        return { ...f, field, value, mode: mode || f.mode || "list", exclude };
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
  // throws on error).
  const requestChartSuggestions = async (
    hint: string,
  ): Promise<ChartConfig[]> => {
    const payload = {
      columns: chartSchema.map(({ key, label, type: columnType, options }) => ({
        key,
        label,
        type: columnType,
        options: options?.slice(0, 20),
        distinctCount: options?.length,
      })),
      // only the chart columns: page-local data (patient names) never leaves
      sampleRows: filteredData.slice(0, 5).map((row) => {
        const truncatedRow: Record<string, any> = {};
        chartSchema.forEach(({ key }) => {
          const value = row[key];
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
    return suggestions.map(withChartDefaults);
  };

  const handleCopiedCharts = (charts: ChartConfig[], summary: CopySummary) => {
    chartCreatorRef.current?.appendCharts(charts);
    trackCustomReportAction(TrackedCustomReportAction.COPY_CHARTS, summary);
    notification.success({
      message: `${charts.length} gráfico(s) copiados. Salve para gravar as alterações.`,
    });
  };

  const exportNames = useMemo<ExportNames | undefined>(
    () =>
      reportNames && patientIdKey && nameColumnKey
        ? { report: reportNames, idKey: patientIdKey, nameKey: nameColumnKey }
        : undefined,
    [reportNames, patientIdKey, nameColumnKey],
  );

  return (
    <>
      <Spin spinning={isLoading}>
        <PageHeader>
          <div>
            <h1 className="page-header-title" data-kb="reports.file.title">Relatório: {title}</h1>
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
                  exclude={filter.exclude}
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
            tabBarExtraContent={
              !isLoading && reportNames ? (
                <LoadPatientNames names={reportNames} />
              ) : null
            }
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
                              excludeKeys={chartExcludeKeys}
                              extraActions={
                                <Button
                                  icon={<CopyOutlined />}
                                  onClick={() => setShowCopyCharts(true)}
                                  disabled={chartSchema.length === 0}
                                >
                                  Copiar de outro relatório
                                </Button>
                              }
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
      <ExportReport
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        idReport={id_report!}
        filename={filename!}
        title={title}
        rows={data}
        names={exportNames}
        onExportingChange={setIsExporting}
      />
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
      {canWriteGraphs && (
        <CopyCharts
          open={showCopyCharts}
          onClose={() => setShowCopyCharts(false)}
          targetSchema={chartSchema}
          existingTitles={currentCharts.map((chart) => chart.title)}
          currentSchemaName={currentSchema}
          onImport={handleCopiedCharts}
        />
      )}
      <FloatButton.BackTop
        style={{ right: 80, bottom: 25 }}
        tooltip="Voltar ao topo"
      />
    </>
  );
}
