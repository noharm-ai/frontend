import React from "react";
import {
  DeleteOutlined,
  UnorderedListOutlined,
  FontSizeOutlined,
} from "@ant-design/icons";
import { Select, Radio, Tooltip } from "antd";
import { InputNumber, RangeDatePicker, Input } from "src/components/Inputs";
import Button from "src/components/Button";
import { ColumnSchema } from "./FileReport.utils";

import { Row, FieldSelect, ValueContainer } from "./FilterRow.style";

interface FilterRowProps {
  id: string;
  field: string;
  value: any;
  mode?: "list" | "text";
  schema: ColumnSchema[];
  onChange: (
    id: string,
    field: string,
    value: any,
    mode?: "list" | "text",
  ) => void;
  onRemove: (id: string) => void;
}

export const FilterRow: React.FC<FilterRowProps> = ({
  id,
  field,
  value,
  mode = "list",
  schema,
  onChange,
  onRemove,
}) => {
  const selectedColumn = schema.find((c) => c.key === field);

  const handleFieldChange = (newField: string) => {
    onChange(id, newField, null, "list");
  };

  const handleValueChange = (newValue: any) => {
    onChange(id, field, newValue, mode);
  };

  const handleModeChange = (e: any) => {
    const newMode = e.target.value;
    onChange(id, field, null, newMode);
  };

  const renderValueInput = () => {
    if (!selectedColumn) return null;

    switch (selectedColumn.type) {
      case "string":
        return (
          <>
            <Radio.Group
              value={mode}
              onChange={handleModeChange}
              optionType="button"
              buttonStyle="solid"
              style={{ width: "100px" }}
            >
              <Tooltip title="Selecionar da lista">
                <Radio.Button value="list">
                  <UnorderedListOutlined />
                </Radio.Button>
              </Tooltip>
              <Tooltip title="Texto livre">
                <Radio.Button value="text">
                  <FontSizeOutlined />
                </Radio.Button>
              </Tooltip>
            </Radio.Group>
            {mode === "text" ? (
              <Input
                placeholder="Digite para buscar..."
                value={value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleValueChange(e.target.value)
                }
                style={{ width: "100%" }}
              />
            ) : (
              <Select
                mode="multiple"
                style={{ width: "100%" }}
                placeholder="Selecione os valores"
                value={value}
                onChange={handleValueChange}
                options={selectedColumn.options?.map((opt) => ({
                  label: opt,
                  value: opt,
                }))}
                showSearch
                allowClear
              />
            )}
          </>
        );
      case "number":
        return (
          <>
            <InputNumber
              placeholder="Mínimo"
              value={value?.[0]}
              onChange={(v: number | null) =>
                handleValueChange([v, value?.[1]])
              }
              style={{ width: 150 }}
            />
            <span>até</span>
            <InputNumber
              placeholder="Máximo"
              value={value?.[1]}
              onChange={(v: number | null) =>
                handleValueChange([value?.[0], v])
              }
              style={{ width: 150 }}
            />
          </>
        );
      case "date":
        return (
          <RangeDatePicker
            value={value}
            onChange={handleValueChange}
            format="DD/MM/YYYY"
            style={{ width: 300 }}
          />
        );
      default:
        return <span>Filtragem não suportada para este tipo</span>;
    }
  };

  return (
    <Row>
      <Button
        danger
        icon={<DeleteOutlined />}
        onClick={() => onRemove(id)}
        shape="circle"
      />
      <FieldSelect
        placeholder="Selecione o campo"
        value={field}
        onChange={(value) => handleFieldChange(value as string)}
        options={schema.map((c) => ({ label: c.label, value: c.key }))}
        showSearch
      />
      <ValueContainer>{renderValueInput()}</ValueContainer>
    </Row>
  );
};
