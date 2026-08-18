import React from "react";
import {
  DeleteOutlined,
  UnorderedListOutlined,
  FontSizeOutlined,
} from "@ant-design/icons";
import { Select, Radio, Segmented, Tooltip } from "antd";
import {
  InputNumber,
  RangeDatePicker,
  Input,
  SelectCustom,
} from "src/components/Inputs";
import Button from "src/components/Button";
import { ColumnSchema } from "./FileReport.utils";

import { Row, FieldSelect, ValueContainer } from "./FilterRow.style";

interface FilterRowProps {
  id: string;
  field: string;
  value: any;
  mode?: "list" | "text";
  exclude?: boolean;
  schema: ColumnSchema[];
  onChange: (
    id: string,
    field: string,
    value: any,
    mode?: "list" | "text",
    exclude?: boolean,
  ) => void;
  onRemove: (id: string) => void;
}

export const FilterRow: React.FC<FilterRowProps> = ({
  id,
  field,
  value,
  mode = "list",
  exclude = false,
  schema,
  onChange,
  onRemove,
}) => {
  const selectedColumn = schema.find((c) => c.key === field);

  const handleFieldChange = (newField: string) => {
    onChange(id, newField, null, "list", false);
  };

  const handleValueChange = (newValue: any) => {
    onChange(id, field, newValue, mode, exclude);
  };

  const handleModeChange = (e: any) => {
    const newMode = e.target.value;
    onChange(id, field, null, newMode, exclude);
  };

  const handleExcludeChange = (newExclude: boolean) => {
    onChange(id, field, value, mode, newExclude);
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
            {mode !== "text" && (
              <Tooltip title="Incluir mantém apenas os valores marcados; Excluir remove-os">
                <Segmented
                  value={exclude ? "out" : "in"}
                  onChange={(v) => handleExcludeChange(v === "out")}
                  options={[
                    { label: "Incluir", value: "in" },
                    { label: "Excluir", value: "out" },
                  ]}
                />
              </Tooltip>
            )}
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
              <SelectCustom
                mode="multiple"
                style={{ width: "100%" }}
                placeholder={
                  exclude ? "Selecione os valores a excluir" : "Selecione os valores"
                }
                value={value}
                onChange={handleValueChange}
                showSearch
                optionFilterProp="children"
                maxTagCount="responsive"
                allowClear
              >
                {selectedColumn.options?.map((opt) => (
                  <Select.Option key={opt} value={opt}>
                    {opt}
                  </Select.Option>
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
