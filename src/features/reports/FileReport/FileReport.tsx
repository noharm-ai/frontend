import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Spin, notification, FloatButton } from "antd";
import { useParams } from "react-router-dom";
import {
  DeleteOutlined,
  PlusOutlined,
  MenuOutlined,
  DownloadOutlined,
  SyncOutlined,
  FileTextOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";

import { useAppDispatch } from "src/store";
import { DataViewer } from "src/components/DataViewer/DataViewer";
import { formatDate } from "src/utils/date";
import { getFileReport } from "../ReportsSlice";
import Button from "src/components/Button";
import { FloatButtonGroup } from "src/components/FloatButton";
import { TrackedReport, trackReport } from "src/utils/tracker";
import { downloadReport } from "src/features/reports/ReportsSlice";
import { getErrorMessage } from "src/utils/errorHandler";

import { PageHeader } from "src/styles/PageHeader.style";
import { FilterContainer, FilterActions, FilterList } from "./FileReport.style";
import Modal from "src/components/Modal";
// import { ChartCreator } from "src/components/ChartCreator/ChartCreator";
import {
  detectColumnSchema,
  applyFilters,
  ColumnSchema,
  Filter,
} from "./FileReport.utils";
import { FilterRow } from "./FilterRow";

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
  };

  const removeFilter = (id: string) => {
    setFilters(filters.filter((f) => f.id !== id));
  };

  const removeAllFilters = () => {
    setFilters([]);
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

          <DataViewer
            data={filteredData}
            onRowClick={() => {}}
            showFilters={false}
          />
          {/* {filteredData && filteredData.length > 0 && (
            <ChartCreator data={filteredData} />
          )} */}
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
      </Modal>
      <FloatButton.BackTop
        style={{ right: 80, bottom: 25 }}
        tooltip="Voltar ao topo"
      />
    </>
  );
}
