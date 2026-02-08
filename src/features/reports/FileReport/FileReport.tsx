import { useState, useEffect, useMemo } from "react";
import { Spin, notification } from "antd";
import { useParams } from "react-router-dom";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";

import { useAppDispatch } from "src/store";
import { DataViewer } from "src/components/DataViewer/DataViewer";
import { formatDate } from "src/utils/date";
import { getFileReport } from "../ReportsSlice";
import Button from "src/components/Button";

import { PageHeader } from "src/styles/PageHeader.style";
import { FilterContainer, FilterActions, FilterList } from "./FileReport.style";
import { ChartCreator } from "./ChartCreator/ChartCreator";
import "styles/base.css";
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
  const { type, id_report, filename } = useParams();
  const [isLoading, setIsLoading] = useState(true);
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

  const updateFilter = (id: string, field: string, value: any) => {
    const updatedFilters = filters.map((f) => {
      if (f.id === id) {
        return { ...f, field, value };
      }
      return f;
    });
    setFilters(updatedFilters);
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
          <div className="page-header-actions">
            {/* <Button
                    type="default"
                    icon={<UnorderedListOutlined />}
                    onClick={() => navigate("/relatorios")}
                  >
                    Ver todos relatórios
                  </Button> */}
          </div>
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
                  schema={schema}
                  onChange={updateFilter}
                  onRemove={removeFilter}
                />
              ))}
            </FilterList>
            <FilterActions>
              <Button icon={<PlusOutlined />} onClick={addFilter}>
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
          {filteredData && filteredData.length > 0 && (
            <ChartCreator data={filteredData} />
          )}
        </div>
      </Spin>
    </>
  );
}
