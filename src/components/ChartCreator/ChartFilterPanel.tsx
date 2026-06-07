import dayjs from "dayjs";
import { Button, Flex, Input, InputNumber, Radio, Select, Tooltip } from "antd";
import {
  DeleteOutlined,
  FontSizeOutlined,
  PlusOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { RangeDatePicker, SelectCustom } from "src/components/Inputs";
import type { Filter, ColumnSchema } from "./types";

interface FilterRowItemProps {
  filter: Filter;
  schema: ColumnSchema[];
  readOnly?: boolean;
  onChange: (id: string, field: string, value: any, mode?: "list" | "text") => void;
  onRemove: (id: string) => void;
}

function FilterRowItem({ filter, schema, readOnly, onChange, onRemove }: FilterRowItemProps) {
  const col = schema.find((s) => s.key === filter.field);

  const handleFieldChange = (newField: string) => {
    onChange(filter.id, newField, null, "list");
  };

  const handleValueChange = (newValue: any) => {
    onChange(filter.id, filter.field, newValue, filter.mode);
  };

  const handleModeChange = (e: any) => {
    onChange(filter.id, filter.field, null, e.target.value);
  };

  const renderValueInput = () => {
    if (!col) return null;

    switch (col.type) {
      case "string":
        return (
          <>
            <Radio.Group
              value={filter.mode ?? "list"}
              onChange={handleModeChange}
              optionType="button"
              buttonStyle="solid"
              disabled={readOnly}
              style={{ flexShrink: 0 }}
            >
              <Tooltip title="Selecionar da lista">
                <Radio.Button value="list"><UnorderedListOutlined /></Radio.Button>
              </Tooltip>
              <Tooltip title="Texto livre">
                <Radio.Button value="text"><FontSizeOutlined /></Radio.Button>
              </Tooltip>
            </Radio.Group>
            {filter.mode === "text" ? (
              <Input
                placeholder="Digite para buscar..."
                value={filter.value}
                onChange={(e) => handleValueChange(e.target.value)}
                disabled={readOnly}
                style={{ flex: 1 }}
              />
            ) : (
              <SelectCustom
                mode="multiple"
                placeholder="Selecione os valores"
                value={filter.value}
                onChange={handleValueChange}
                disabled={readOnly}
                showSearch
                optionFilterProp="children"
                maxTagCount="responsive"
                allowClear
                style={{ flex: 1 }}
              >
                {col.options?.map((opt) => (
                  <Select.Option key={opt} value={opt}>{opt}</Select.Option>
                ))}
              </SelectCustom>
            )}
          </>
        );
      case "number":
        return (
          <>
            <InputNumber
              placeholder="Mínimo"
              value={filter.value?.[0]}
              onChange={(v) => handleValueChange([v, filter.value?.[1]])}
              disabled={readOnly}
              style={{ width: 120 }}
            />
            <span>até</span>
            <InputNumber
              placeholder="Máximo"
              value={filter.value?.[1]}
              onChange={(v) => handleValueChange([filter.value?.[0], v])}
              disabled={readOnly}
              style={{ width: 120 }}
            />
          </>
        );
      case "date": {
        const dateValue = Array.isArray(filter.value)
          ? filter.value.map((v: any) => (v ? dayjs(v) : null))
          : filter.value;
        return (
          <RangeDatePicker
            value={dateValue}
            onChange={handleValueChange}
            disabled={readOnly}
            format="DD/MM/YYYY"
            style={{ flex: 1 }}
          />
        );
      }
      default:
        return <span style={{ color: "#999", fontSize: 12 }}>Tipo não suportado</span>;
    }
  };

  return (
    <Flex gap={8} align="center" wrap="wrap">
      {!readOnly && (
        <Button
          danger
          type="text"
          icon={<DeleteOutlined />}
          onClick={() => onRemove(filter.id)}
          size="small"
        />
      )}
      <Select
        placeholder="Campo"
        value={filter.field || undefined}
        onChange={handleFieldChange}
        disabled={readOnly}
        showSearch
        style={{ width: 160, flexShrink: 0 }}
        options={schema.map((c) => ({ label: c.label, value: c.key }))}
      />
      <Flex gap={8} align="center" style={{ flex: 1, minWidth: 0 }}>
        {renderValueInput()}
      </Flex>
    </Flex>
  );
}

interface ChartFilterPanelProps {
  filters: Filter[];
  schema: ColumnSchema[];
  readOnly?: boolean;
  onChange: (newFilters: Filter[]) => void;
}

export function ChartFilterPanel({ filters, schema, readOnly, onChange }: ChartFilterPanelProps) {
  const addFilter = () => {
    onChange([
      ...filters,
      {
        id: Math.random().toString(36).slice(2, 11),
        field: schema[0]?.key ?? "",
        value: null,
        mode: "list",
      },
    ]);
  };

  const updateFilter = (id: string, field: string, value: any, mode?: "list" | "text") => {
    onChange(filters.map((f) => (f.id === id ? { ...f, field, value, mode } : f)));
  };

  const removeFilter = (id: string) => {
    onChange(filters.filter((f) => f.id !== id));
  };

  return (
    <Flex vertical gap={8}>
      {filters.map((f) => (
        <FilterRowItem
          key={f.id}
          filter={f}
          schema={schema}
          readOnly={readOnly}
          onChange={updateFilter}
          onRemove={removeFilter}
        />
      ))}
      {!readOnly && (
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={addFilter}
          size="small"
          style={{ alignSelf: "flex-start" }}
        >
          Adicionar filtro
        </Button>
      )}
      {filters.length === 0 && (
        <span style={{ color: "#999", fontSize: 12 }}>
          Nenhum filtro configurado
        </span>
      )}
    </Flex>
  );
}
