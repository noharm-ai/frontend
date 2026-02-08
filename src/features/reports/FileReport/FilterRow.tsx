import React from "react";
import { DeleteOutlined } from "@ant-design/icons";
import { Select } from "antd";
import { InputNumber, RangeDatePicker } from "src/components/Inputs";
import Button from "src/components/Button";
import { ColumnSchema } from "./FileReport.utils";

import { Row, FieldSelect, ValueContainer } from "./FilterRow.style";

interface FilterRowProps {
  id: string;
  field: string;
  value: any;
  schema: ColumnSchema[];
  onChange: (id: string, field: string, value: any) => void;
  onRemove: (id: string) => void;
}

export const FilterRow: React.FC<FilterRowProps> = ({
  id,
  field,
  value,
  schema,
  onChange,
  onRemove,
}) => {
  const selectedColumn = schema.find((c) => c.key === field);

  const handleFieldChange = (newField: string) => {
    onChange(id, newField, null);
  };

  const handleValueChange = (newValue: any) => {
    onChange(id, field, newValue);
  };

  const renderValueInput = () => {
    if (!selectedColumn) return null;

    switch (selectedColumn.type) {
      case "string":
        return (
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
