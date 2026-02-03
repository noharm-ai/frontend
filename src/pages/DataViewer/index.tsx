import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
  VisibilityState,
  ColumnSizingState,
  FilterFn,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import styled from 'styled-components';
import debounce from 'lodash/debounce';
import { Dropdown, Checkbox } from 'antd';
import {
  SearchOutlined,
  SettingOutlined,
  DownloadOutlined,
  ClearOutlined,
  CaretUpOutlined,
  CaretDownOutlined,
} from '@ant-design/icons';

import { Input } from 'components/Inputs';
import Button from 'components/Button';
import { Drawer } from 'antd';
import Spin from 'components/Spin';
import Empty from 'components/Empty';
import Tag from 'components/Tag';
import Tooltip from 'components/Tooltip';

import { PageCard } from 'styles/Utils.style';
import { get } from 'styles/utils';

type DataRow = Record<string, unknown> & { _index?: number };

interface ColumnMeta {
  key: string;
  title: string;
  type: 'string' | 'number' | 'boolean' | 'object';
}

interface DataViewerProps {
  data: DataRow[];
  height?: number;
  title?: string;
  hiddenColumns?: string[];
  onRowClick?: (record: DataRow) => void;
  loading?: boolean;
}

const Container = styled(PageCard) <{ $height: number }>`
  display: flex;
  flex-direction: column;
  height: ${p => p.$height}px;
  padding: 0;
  margin: 0;
  overflow: hidden;
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(244, 244, 244, 0.6);
  border-bottom: 1px solid ${get('colors.detail')};
  gap: 12px;
  flex-wrap: wrap;
`;

const ToolbarSection = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: ${get('colors.primary')};
`;

const SearchWrapper = styled.div`
  .ant-input-affix-wrapper {
    width: 280px;

    &:hover,
    &:focus,
    &.ant-input-affix-wrapper-focused {
      border-color: ${get('colors.accentSecondary')};
    }

    &.ant-input-affix-wrapper-focused {
      box-shadow: 0 0 0 2px rgba(112, 189, 195, 0.2);
    }
  }
`;

const TableContainer = styled.div`
  flex: 1;
  overflow: hidden;
  position: relative;
`;

const TableWrapper = styled.div`
  height: 100%;
  overflow: auto;

  &::-webkit-scrollbar {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    background-color: rgba(0, 0, 0, 0.05);
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background-color: ${get('colors.accentSecondary')};
    border: 2px solid transparent;
    background-clip: content-box;
  }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
`;

const TableHead = styled.thead`
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(244, 244, 244, 0.95);
`;

const TableHeadRow = styled.tr``;

const TableHeadCell = styled.th<{ $sortable?: boolean; $sorted?: boolean }>`
  padding: 10px 12px;
  font-weight: 600;
  font-size: 12px;
  color: ${get('colors.primary')};
  border-bottom: 1px solid ${get('colors.detail')};
  white-space: nowrap;
  cursor: ${p => p.$sortable ? 'pointer' : 'default'};
  user-select: none;
  transition: background 0.15s;
  position: relative;
  background: ${p => p.$sorted ? 'rgba(126, 190, 154, 0.15)' : 'rgba(244, 244, 244, 0.95)'};
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    background: ${p => p.$sortable ? 'rgba(244, 244, 244, 1)' : 'rgba(244, 244, 244, 0.95)'};
  }
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  overflow: hidden;
`;

const HeaderText = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SortIndicator = styled.span<{ $active?: boolean }>`
  flex-shrink: 0;
  color: ${p => p.$active ? get('colors.accent') : '#d9d9d9'};
  font-size: 12px;
`;

const Resizer = styled.div<{ $isResizing?: boolean }>`
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 6px;
  cursor: col-resize;
  user-select: none;
  touch-action: none;
  background: ${p => p.$isResizing ? get('colors.accent') : 'transparent'};
  transition: background 0.15s;

  &:hover {
    background: ${get('colors.accentSecondary')};
  }
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr<{ $even?: boolean }>`
  background: ${p => p.$even ? 'rgba(244, 244, 244, 0.4)' : '#fff'};
  transition: background 0.1s;
  cursor: pointer;

  &:hover {
    background: rgba(244, 244, 244, 0.8) !important;
  }
`;

const TableCell = styled.td`
  padding: 8px 12px;
  font-size: 13px;
  color: rgba(0, 0, 0, 0.65);
  border-bottom: 1px solid #f0f0f0;
  vertical-align: top;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CellContent = styled.div<{ $truncate?: boolean }>`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: ${p => p.$truncate ? 'nowrap' : 'pre-wrap'};
  word-break: break-word;
  max-height: ${p => p.$truncate ? '22px' : 'none'};
`;

const NumberCell = styled.span`
  font-family: 'SF Mono', Consolas, 'Liberation Mono', monospace;
  font-size: 13px;
`;

const ColumnDropdownContent = styled.div`
  padding: 8px;
  min-width: 220px;
  max-height: 320px;
  overflow-y: auto;
`;

const DropdownHeader = styled.div`
  display: flex;
  gap: 8px;
  padding-bottom: 8px;
  margin-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
`;

const CheckboxItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 13px;

  &:hover {
    background: rgba(244, 244, 244, 0.8);
  }

  .ant-checkbox-wrapper {
    width: 100%;
  }
`;

const TypeTag = styled(Tag) <{ $type: string }>`
  font-size: 10px;
  padding: 0 6px;
  margin-left: auto;
  line-height: 18px;
`;

const FieldItem = styled.div`
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
`;

const FieldLabel = styled.div`
  font-weight: 600;
  color: ${get('colors.primary')};
  margin-bottom: 6px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const FieldValue = styled.div<{ $type?: string }>`
  color: rgba(0, 0, 0, 0.65);
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 14px;
  line-height: 1.6;
  background: ${p => p.$type === 'number' ? 'rgba(112, 189, 195, 0.1)' : 'rgba(244, 244, 244, 0.6)'};
  padding: 12px;
  border-radius: 6px;
  max-height: 400px;
  overflow-y: auto;
  font-family: ${p => p.$type === 'number' ? "'SF Mono', Consolas, monospace" : 'inherit'};
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
`;

const EmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: ${get('colors.text')};
`;

const VirtualRowContainer = styled.div`
  position: relative;
`;

const detectColumnType = (values: unknown[]): ColumnMeta['type'] => {
  const sample = values.slice(0, 100).filter(v => v !== null && v !== undefined && v !== '');
  if (sample.length === 0) return 'string';

  if (sample.every(v => typeof v === 'number' || (!isNaN(Number(v)) && v !== ''))) {
    return 'number';
  }
  if (sample.every(v => typeof v === 'boolean' || v === 'true' || v === 'false')) {
    return 'boolean';
  }
  if (sample.every(v => typeof v === 'object')) {
    return 'object';
  }
  return 'string';
};

const inferColumnsFromData = (data: DataRow[]): ColumnMeta[] => {
  if (data.length === 0) return [];

  const allKeys = new Set<string>();
  data.forEach(row => {
    Object.keys(row).forEach(key => {
      if (key !== '_index') allKeys.add(key);
    });
  });

  return Array.from(allKeys).map(key => {
    const values = data.map(row => row[key]);
    return {
      key,
      title: key,
      type: detectColumnType(values),
    };
  });
};

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
};

const exportToCSV = (data: DataRow[], columns: ColumnMeta[], filename: string) => {
  const headers = columns.map(c => `"${c.title}"`).join(',');

  const rows = data.map(row =>
    columns.map(col => {
      const value = formatValue(row[col.key]);
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return `"${value}"`;
    }).join(',')
  );

  const csv = [headers, ...rows].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
};

const globalFilterFn: FilterFn<DataRow> = (row, _columnId, filterValue) => {
  const search = filterValue.toLowerCase();
  return Object.entries(row.original)
    .filter(([key]) => key !== '_index')
    .some(([, value]) => String(value ?? '').toLowerCase().includes(search));
};

export const DataViewer: React.FC<DataViewerProps> = ({
  data,
  height = 600,
  title,
  hiddenColumns = [],
  onRowClick,
  loading = false,
}) => {
  const indexedData: DataRow[] = useMemo(() =>
    data.map((row, index) => ({ ...row, _index: index })),
    [data]
  );

  const columnsMeta = useMemo(() => inferColumnsFromData(data), [data]);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => {
    const visibility: VisibilityState = {};
    hiddenColumns.forEach(col => { visibility[col] = false; });
    return visibility;
  });
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});
  const [columnDropdownOpen, setColumnDropdownOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DataRow | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const tableContainerRef = useRef<HTMLDivElement>(null);

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<DataRow>();

    return columnsMeta.map(col =>
      columnHelper.accessor(row => row[col.key], {
        id: col.key,
        header: col.title,
        cell: info => {
          const value = info.getValue();
          const formatted = formatValue(value);

          if (col.type === 'number' && typeof value === 'number') {
            return <NumberCell>{value.toLocaleString('pt-BR')}</NumberCell>;
          }

          const isLong = formatted.length > 60;
          return (
            <CellContent $truncate={isLong} title={formatted}>
              {formatted}
            </CellContent>
          );
        },
        sortingFn: col.type === 'number' ? 'alphanumeric' : 'text',
        size: col.type === 'number' ? 120 : 180,
        minSize: 80,
        maxSize: 500,
      })
    );
  }, [columnsMeta]);

  const table = useReactTable({
    data: indexedData,
    columns,
    state: {
      sorting,
      globalFilter,
      columnVisibility,
      columnSizing,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn,
    columnResizeMode: 'onChange',
    enableColumnResizing: true,
  });

  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 40,
    overscan: 15,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  const debouncedSearch = useMemo(
    () => debounce((value: string) => setGlobalFilter(value), 250),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  const handleRowClick = useCallback((record: DataRow) => {
    setSelectedRecord(record);
    setDrawerOpen(true);
    onRowClick?.(record);
  }, [onRowClick]);

  const handleExport = useCallback(() => {
    const visibleCols = columnsMeta.filter(col => columnVisibility[col.key] !== false);
    exportToCSV(rows.map(r => r.original), visibleCols, `export-${Date.now()}.csv`);
  }, [rows, columnsMeta, columnVisibility]);

  const clearSearch = useCallback(() => {
    setSearchValue('');
    setGlobalFilter('');
  }, []);

  const showAllColumns = useCallback(() => {
    const visibility: VisibilityState = {};
    columnsMeta.forEach(col => { visibility[col.key] = true; });
    setColumnVisibility(visibility);
  }, [columnsMeta]);

  const hideAllColumns = useCallback(() => {
    const visibility: VisibilityState = {};
    columnsMeta.forEach(col => { visibility[col.key] = false; });
    setColumnVisibility(visibility);
  }, [columnsMeta]);

  const getTypeTagColor = (type: string) => {
    switch (type) {
      case 'number': return 'cyan';
      case 'boolean': return 'green';
      case 'object': return 'purple';
      default: return 'default';
    }
  };

  const getTypeTagLabel = (type: string) => {
    switch (type) {
      case 'number': return 'Número';
      case 'boolean': return 'Sim/Não';
      case 'object': return 'Objeto';
      case 'string': return 'Texto';
      default: return 'Não identificado';
    }
  };

  const columnDropdownContent = (
    <ColumnDropdownContent>
      <DropdownHeader>
        <Button size="small" onClick={showAllColumns}>Mostrar todas</Button>
        <Button size="small" onClick={hideAllColumns}>Ocultar todas</Button>
      </DropdownHeader>
      {columnsMeta.map(col => (
        <CheckboxItem key={col.key}>
          <Checkbox
            checked={columnVisibility[col.key] !== false}
            onChange={() => {
              setColumnVisibility(prev => ({
                ...prev,
                [col.key]: prev[col.key] === false ? true : false
              }));
            }}
          >
            {col.title}
          </Checkbox>
          <TypeTag $type={col.type} color={getTypeTagColor(col.type)}>{getTypeTagLabel(col.type)}</TypeTag>
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

  const visibleColumns = table.getVisibleLeafColumns();

  const tableWidth = table.getTotalSize();

  return (
    <>
      <Container $height={height}>
        <Toolbar>
          <ToolbarSection>
            {title && <Title>{title}</Title>}

            <SearchWrapper>
              <Input
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="Buscar em todas as colunas..."
                value={searchValue}
                onChange={handleSearchChange}
                allowClear
                onClear={clearSearch}
                style={{ width: 280 }}
              />
            </SearchWrapper>

            <Tag color="blue">
              {rows.length.toLocaleString()} de {data.length.toLocaleString()}
            </Tag>

            <Tag color="green">
              {visibleColumns.length}/{columnsMeta.length} colunas
            </Tag>
          </ToolbarSection>

          <ToolbarSection>
            <Tooltip title="Limpar busca">
              <Button
                icon={<ClearOutlined />}
                onClick={clearSearch}
                disabled={!globalFilter}
              />
            </Tooltip>

            <Dropdown
              open={columnDropdownOpen}
              onOpenChange={setColumnDropdownOpen}
              dropdownRender={() => columnDropdownContent}
              trigger={['click']}
              placement="bottomRight"
            >
              <Tooltip title="Configurar colunas">
                <Button
                  icon={<SettingOutlined />}
                  type={columnDropdownOpen ? 'primary' : 'default'}
                />
              </Tooltip>
            </Dropdown>

            <Tooltip title="Exportar CSV">
              <Button
                icon={<DownloadOutlined />}
                onClick={handleExport}
              />
            </Tooltip>
          </ToolbarSection>
        </Toolbar>

        <TableContainer>
          {loading && (
            <LoadingOverlay>
              <Spin size="large" />
            </LoadingOverlay>
          )}

          <TableWrapper ref={tableContainerRef}>
            <StyledTable style={{ width: tableWidth }}>
              <TableHead>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableHeadRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => {
                      const sorted = header.column.getIsSorted();
                      return (
                        <TableHeadCell
                          key={header.id}
                          $sortable={header.column.getCanSort()}
                          $sorted={!!sorted}
                          style={{ width: header.getSize() }}
                        >
                          <HeaderContent
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            <HeaderText>
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </HeaderText>
                            <SortIndicator $active={!!sorted}>
                              {sorted === 'asc' ? <CaretUpOutlined /> : sorted === 'desc' ? <CaretDownOutlined /> : null}
                            </SortIndicator>
                          </HeaderContent>
                          <Resizer
                            $isResizing={header.column.getIsResizing()}
                            onMouseDown={header.getResizeHandler()}
                            onTouchStart={header.getResizeHandler()}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableHeadCell>
                      );
                    })}
                  </TableHeadRow>
                ))}
              </TableHead>

              <TableBody>
                <tr>
                  <td colSpan={visibleColumns.length} style={{ padding: 0 }}>
                    <VirtualRowContainer style={{ height: `${totalSize}px` }}>
                      {virtualRows.map(virtualRow => {
                        const row = rows[virtualRow.index];
                        return (
                          <TableRow
                            as="div"
                            key={row.id}
                            $even={virtualRow.index % 2 === 0}
                            style={{
                              display: 'flex',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: `${virtualRow.size}px`,
                              transform: `translateY(${virtualRow.start}px)`,
                            }}
                            onClick={() => handleRowClick(row.original)}
                          >
                            {row.getVisibleCells().map(cell => (
                              <TableCell
                                as="div"
                                key={cell.id}
                                style={{
                                  width: cell.column.getSize(),
                                  flexShrink: 0,
                                }}
                              >
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </TableCell>
                            ))}
                          </TableRow>
                        );
                      })}
                    </VirtualRowContainer>
                  </td>
                </tr>
              </TableBody>
            </StyledTable>
          </TableWrapper>
        </TableContainer>
      </Container>

      <Drawer
        title={`Registro #${selectedRecord?._index !== undefined ? selectedRecord._index + 1 : ''}`}
        placement="right"
        width={600}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
      >
        {selectedRecord && columnsMeta.map(col => {
          const value = selectedRecord[col.key];
          if (value === null || value === undefined || value === '') return null;

          return (
            <FieldItem key={col.key}>
              <FieldLabel>{col.title}</FieldLabel>
              <FieldValue $type={col.type}>
                {formatValue(value)}
              </FieldValue>
            </FieldItem>
          );
        })}
      </Drawer>
    </>
  );
};

export default DataViewer;