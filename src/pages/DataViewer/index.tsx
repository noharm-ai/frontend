import React, { useState, useMemo, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import debounce from 'lodash/debounce';
import { Dropdown, Checkbox, Table as AntTable } from 'antd';
import type { TableColumnsType, TableProps } from 'antd';
import type { ColumnType } from 'antd/es/table';
import {
  SearchOutlined,
  SettingOutlined,
  ClearOutlined,
} from '@ant-design/icons';

import { Input } from 'components/Inputs';
import Button from 'components/Button';
import { Drawer } from 'antd';
import Empty from 'components/Empty';
import Tag from 'components/Tag';
import Tooltip from 'components/Tooltip';

import { PageCard } from 'styles/Utils.style';
import { get } from 'styles/utils';

type DataRow = Record<string, unknown> & { _index?: number; key?: string | number };

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

  .ant-table-wrapper {
    flex: 1;
    overflow: hidden;

    .ant-spin-nested-loading,
    .ant-spin-container {
      height: 100%;
    }
  }

  .ant-table {
    height: 100%;

    .ant-table-container {
      height: 100%;
      display: flex;
      flex-direction: column;

      .ant-table-header {
        flex-shrink: 0;
      }

      .ant-table-body {
        flex: 1;
        overflow: auto !important;

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
      }
    }
  }

  .ant-table-thead > tr > th {
    background: rgba(244, 244, 244, 0.95);
    color: ${get('colors.primary')};
    font-weight: 600;
    font-size: 12px;
    padding: 10px 12px;
  }

  .ant-table-tbody > tr > td {
    padding: 8px 12px;
    font-size: 13px;
    color: rgba(0, 0, 0, 0.65);
  }

  .ant-table-tbody > tr:hover > td {
    background: rgba(244, 244, 244, 0.8) !important;
  }

  .ant-table-tbody > tr:nth-child(even) > td {
    background: rgba(244, 244, 244, 0.4);
  }

  .ant-table-column-sorter {
    color: ${get('colors.accent')};
  }

  .ant-table-column-sort {
    background: rgba(126, 190, 154, 0.1);
  }

  .ant-table-row {
    cursor: pointer;
  }

  .ant-table-cell-ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ant-table-resize-handle {
    position: absolute;
    top: 0;
    right: -5px;
    bottom: 0;
    width: 10px;
    cursor: col-resize;
    z-index: 1;

    &:hover {
      background: ${get('colors.accentSecondary')};
      opacity: 0.5;
    }
  }
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

const NumberCell = styled.span`
  font-family: 'SF Mono', Consolas, 'Liberation Mono', monospace;
  font-size: 13px;
`;

const ColumnDropdownContent = styled.div`
  padding: 8px;
  min-width: 220px;
  max-height: 320px;
  overflow-y: auto;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08),
              0 3px 6px -4px rgba(0, 0, 0, 0.12),
              0 9px 28px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #f0f0f0;
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

const EmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: ${get('colors.text')};
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
      if (key !== '_index' && key !== 'key') allKeys.add(key);
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

export const DataViewer: React.FC<DataViewerProps> = ({
  data,
  height = 600,
  title,
  hiddenColumns = [],
  onRowClick,
  loading = false,
}) => {
  const indexedData: DataRow[] = useMemo(() =>
    data.map((row, index) => ({ ...row, _index: index, key: index })),
    [data]
  );

  const columnsMeta = useMemo(() => inferColumnsFromData(data), [data]);

  const [globalFilter, setGlobalFilter] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [hiddenColumnKeys, setHiddenColumnKeys] = useState<Set<string>>(() => new Set(hiddenColumns));
  const [columnDropdownOpen, setColumnDropdownOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DataRow | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filteredData = useMemo(() => {
    if (!globalFilter) return indexedData;

    const search = globalFilter.toLowerCase();
    return indexedData.filter(row =>
      Object.entries(row)
        .filter(([key]) => key !== '_index' && key !== 'key')
        .some(([, value]) => String(value ?? '').toLowerCase().includes(search))
    );
  }, [indexedData, globalFilter]);

  const antColumns: TableColumnsType<DataRow> = useMemo(() => {
    return columnsMeta
      .filter(col => !hiddenColumnKeys.has(col.key))
      .map(col => {
        const column: ColumnType<DataRow> = {
          title: col.title,
          dataIndex: col.key,
          key: col.key,
          sorter: true,
          ellipsis: true,
          width: col.type === 'number' ? 120 : 180,
          render: (value: unknown) => {
            const formatted = formatValue(value);

            if (col.type === 'number' && typeof value === 'number') {
              return <NumberCell>{value.toLocaleString('pt-BR')}</NumberCell>;
            }

            return (
              <span title={formatted}>
                {formatted}
              </span>
            );
          },
        };

        if (col.type === 'number') {
          column.sorter = (a, b) => {
            const aVal = Number(a[col.key]) || 0;
            const bVal = Number(b[col.key]) || 0;
            return aVal - bVal;
          };
        } else {
          column.sorter = (a, b) => {
            const aVal = String(a[col.key] ?? '');
            const bVal = String(b[col.key] ?? '');
            return aVal.localeCompare(bVal);
          };
        }

        return column;
      });
  }, [columnsMeta, hiddenColumnKeys]);

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

  const clearSearch = useCallback(() => {
    setSearchValue('');
    setGlobalFilter('');
  }, []);

  const showAllColumns = useCallback(() => {
    setHiddenColumnKeys(new Set());
  }, []);

  const hideAllColumns = useCallback(() => {
    setHiddenColumnKeys(new Set(columnsMeta.map(col => col.key)));
  }, [columnsMeta]);

  const toggleColumnVisibility = useCallback((key: string) => {
    setHiddenColumnKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

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
            checked={!hiddenColumnKeys.has(col.key)}
            onChange={() => toggleColumnVisibility(col.key)}
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

  const visibleColumnsCount = columnsMeta.length - hiddenColumnKeys.size;

  const tableProps: TableProps<DataRow> = {
    columns: antColumns,
    dataSource: filteredData,
    loading,
    pagination: false,
    virtual: true,
    scroll: { x: 'max-content', y: height - 120 },
    size: 'small',
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
              {filteredData.length.toLocaleString()} de {data.length.toLocaleString()}
            </Tag>

            <Tag color="green">
              {visibleColumnsCount}/{columnsMeta.length} colunas
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
          </ToolbarSection>
        </Toolbar>

        <AntTable {...tableProps} />
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