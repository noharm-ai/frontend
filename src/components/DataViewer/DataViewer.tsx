import React, { useState, useMemo, useCallback, useEffect } from "react";
import debounce from "lodash/debounce";
import { Dropdown, Checkbox, Table as AntTable } from "antd";
import type { TableColumnsType, TableProps } from "antd";
import type { ColumnType } from "antd/es/table";
import {
  SearchOutlined,
  SettingOutlined,
  ClearOutlined,
} from "@ant-design/icons";

import { Input } from "components/Inputs";
import Button from "components/Button";
import { Drawer } from "antd";
import Empty from "components/Empty";
import Tag from "components/Tag";
import Tooltip from "components/Tooltip";

import {
  Container,
  Toolbar,
  ToolbarSection,
  Title,
  SearchWrapper,
  NumberCell,
  ColumnDropdownContent,
  DropdownHeader,
  CheckboxItem,
  TypeTag,
  FieldItem,
  FieldLabel,
  FieldValue,
  EmptyContainer,
} from "./DataViewer.style";

import {
  inferColumnsFromData,
  formatValue,
  getTypeTagColor,
  getTypeTagLabel,
} from "./DataViewer.utils";

export type DataRow = Record<string, unknown> & {
  _index?: number;
  key?: string | number;
};

export interface ColumnMeta {
  key: string;
  title: string;
  type: "string" | "number" | "boolean" | "object";
}

export interface DataViewerProps {
  data: DataRow[];
  height?: number;
  title?: string;
  hiddenColumns?: string[];
  onRowClick?: (record: DataRow) => void;
  loading?: boolean;
  showFilters?: boolean;
}

export const DataViewer: React.FC<DataViewerProps> = ({
  data,
  height = 600,
  title,
  hiddenColumns = [],
  onRowClick,
  loading = false,
  showFilters = true,
}) => {
  const indexedData: DataRow[] = useMemo(
    () => data.map((row, index) => ({ ...row, _index: index, key: index })),
    [data],
  );

  const columnsMeta = useMemo(() => inferColumnsFromData(data), [data]);

  const [globalFilter, setGlobalFilter] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [hiddenColumnKeys, setHiddenColumnKeys] = useState<Set<string>>(
    () => new Set(hiddenColumns),
  );
  const [columnDropdownOpen, setColumnDropdownOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DataRow | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filteredData = useMemo(() => {
    if (!globalFilter) return indexedData;

    const search = globalFilter.toLowerCase();
    return indexedData.filter((row) =>
      Object.entries(row)
        .filter(([key]) => key !== "_index" && key !== "key")
        .some(([, value]) =>
          String(value ?? "")
            .toLowerCase()
            .includes(search),
        ),
    );
  }, [indexedData, globalFilter]);

  const antColumns: TableColumnsType<DataRow> = useMemo(() => {
    return columnsMeta
      .filter((col) => !hiddenColumnKeys.has(col.key))
      .map((col) => {
        const column: ColumnType<DataRow> = {
          title: col.title,
          dataIndex: col.key,
          key: col.key,
          sorter: true,
          ellipsis: true,
          width: col.type === "number" ? 120 : 180,
          render: (value: unknown) => {
            const formatted = formatValue(value);

            if (col.type === "number" && typeof value === "number") {
              return <NumberCell>{value.toLocaleString("pt-BR")}</NumberCell>;
            }

            return <span title={formatted}>{formatted}</span>;
          },
        };

        if (col.type === "number") {
          column.sorter = (a, b) => {
            const aVal = Number(a[col.key]) || 0;
            const bVal = Number(b[col.key]) || 0;
            return aVal - bVal;
          };
        } else {
          column.sorter = (a, b) => {
            const aVal = String(a[col.key] ?? "");
            const bVal = String(b[col.key] ?? "");
            return aVal.localeCompare(bVal);
          };
        }

        return column;
      });
  }, [columnsMeta, hiddenColumnKeys]);

  const debouncedSearch = useMemo(
    () => debounce((value: string) => setGlobalFilter(value), 250),
    [],
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchValue(value);
      debouncedSearch(value);
    },
    [debouncedSearch],
  );

  const handleRowClick = useCallback(
    (record: DataRow) => {
      setSelectedRecord(record);
      setDrawerOpen(true);
      onRowClick?.(record);
    },
    [onRowClick],
  );

  const clearSearch = useCallback(() => {
    setSearchValue("");
    setGlobalFilter("");
  }, []);

  const showAllColumns = useCallback(() => {
    setHiddenColumnKeys(new Set());
  }, []);

  const hideAllColumns = useCallback(() => {
    setHiddenColumnKeys(new Set(columnsMeta.map((col) => col.key)));
  }, [columnsMeta]);

  const toggleColumnVisibility = useCallback((key: string) => {
    setHiddenColumnKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const columnDropdownContent = (
    <ColumnDropdownContent>
      <DropdownHeader>
        <Button size="small" onClick={showAllColumns}>
          Mostrar todas
        </Button>
        <Button size="small" onClick={hideAllColumns}>
          Ocultar todas
        </Button>
      </DropdownHeader>
      {columnsMeta.map((col) => (
        <CheckboxItem key={col.key}>
          <Checkbox
            checked={!hiddenColumnKeys.has(col.key)}
            onChange={() => toggleColumnVisibility(col.key)}
          >
            {col.title}
          </Checkbox>
          <TypeTag $type={col.type} color={getTypeTagColor(col.type)}>
            {getTypeTagLabel(col.type)}
          </TypeTag>
        </CheckboxItem>
      ))}
    </ColumnDropdownContent>
  );

  if (data.length === 0 && !loading) {
    return (
      <Container $height={height}>
        <EmptyContainer>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Nenhum dado disponível"
          />
        </EmptyContainer>
      </Container>
    );
  }

  const visibleColumnsCount = columnsMeta.length - hiddenColumnKeys.size;

  const tableProps: TableProps<DataRow> = {
    columns: antColumns,
    dataSource: filteredData,
    loading,
    pagination: false,
    virtual: true,
    scroll: { x: "max-content", y: height - 120 },
    size: "small",
    showSorterTooltip: false,
    onRow: (record) => ({
      onClick: () => handleRowClick(record),
    }),
    locale: {
      emptyText: (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Nenhum dado encontrado"
        />
      ),
    },
  };

  return (
    <>
      <Container $height={height}>
        <Toolbar>
          <ToolbarSection>
            {title && <Title>{title}</Title>}

            {showFilters && (
              <SearchWrapper>
                <Input
                  prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                  placeholder="Buscar em todas as colunas..."
                  value={searchValue}
                  onChange={handleSearchChange}
                  allowClear
                  onClear={clearSearch}
                  style={{ width: 280 }}
                />
              </SearchWrapper>
            )}

            <Tag color="blue">
              {filteredData.length.toLocaleString()} de{" "}
              {data.length.toLocaleString()}
            </Tag>

            <Tag color="green">
              {visibleColumnsCount}/{columnsMeta.length} colunas
            </Tag>
          </ToolbarSection>

          <ToolbarSection>
            {showFilters && (
              <Tooltip title="Limpar busca">
                <Button
                  icon={<ClearOutlined />}
                  onClick={clearSearch}
                  disabled={!globalFilter}
                />
              </Tooltip>
            )}

            <Dropdown
              open={columnDropdownOpen}
              onOpenChange={setColumnDropdownOpen}
              dropdownRender={() => columnDropdownContent}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Tooltip title="Configurar colunas">
                <Button
                  icon={<SettingOutlined />}
                  type={columnDropdownOpen ? "primary" : "default"}
                />
              </Tooltip>
            </Dropdown>
          </ToolbarSection>
        </Toolbar>

        <AntTable {...tableProps} />
      </Container>

      <Drawer
        title={`Registro #${selectedRecord?._index !== undefined ? selectedRecord._index + 1 : ""}`}
        placement="right"
        width={600}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
      >
        {selectedRecord &&
          columnsMeta.map((col) => {
            const value = selectedRecord[col.key];
            if (value === null || value === undefined || value === "")
              return null;

            return (
              <FieldItem key={col.key}>
                <FieldLabel>{col.title}</FieldLabel>
                <FieldValue $type={col.type}>{formatValue(value)}</FieldValue>
              </FieldItem>
            );
          })}
      </Drawer>
    </>
  );
};

export default DataViewer;
