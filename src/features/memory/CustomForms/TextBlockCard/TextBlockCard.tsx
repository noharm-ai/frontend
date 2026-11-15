import { useRef } from "react";
import { Popconfirm } from "antd";
import {
  DeleteOutlined,
  DownOutlined,
  PlusOutlined,
  UpOutlined,
} from "@ant-design/icons";

import Editor from "components/Editor";
import { Input, Select } from "components/Inputs";
import Button from "components/Button";
import Tooltip from "components/Tooltip";

import { BlockCard } from "../CustomTextBody/CustomTextBody.style";
import { ConditionRow } from "../ConditionRow/ConditionRow";
import { VariableMenu } from "../VariableMenu/VariableMenu";
import { FormGroup, TextBlock, TextCondition, emptyCondition } from "../types";

interface TextBlockCardProps {
  block: TextBlock;
  bIdx: number;
  total: number;
  groups: FormGroup[];
  errors: any;
  onChange: (block: TextBlock) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}

const LOGIC_OPTIONS = [
  { value: "and", label: "todas as condições" },
  { value: "or", label: "qualquer uma das condições" },
];

/** A block of the custom text: its conditions and its rich text. */
export function TextBlockCard({
  block,
  bIdx,
  total,
  groups,
  errors,
  onChange,
  onMove,
  onRemove,
}: TextBlockCardProps) {
  const editorRef = useRef<any>(null);
  const conditions = block.conditions ?? [];
  const conditionErrors: any[] = errors?.conditions ?? [];
  const hasError =
    !!errors?.content || conditionErrors.some((error) => !!error);

  const updateCondition = (cIdx: number, condition: TextCondition) =>
    onChange({
      ...block,
      conditions: conditions.map((c, i) => (i === cIdx ? condition : c)),
    });

  const removeCondition = (cIdx: number) =>
    onChange({
      ...block,
      conditions: conditions.filter((_, i) => i !== cIdx),
    });

  const addCondition = () =>
    onChange({ ...block, conditions: [...conditions, emptyCondition()] });

  return (
    <BlockCard
      className={hasError ? "has-error" : undefined}
      data-testid="text-block"
    >
      <div className="block-header">
        <span className="block-title">Bloco {bIdx + 1}</span>
        <Input
          className="block-name"
          value={block.name ?? ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onChange({ ...block, name: e.target.value })
          }
          placeholder="Nome do bloco (opcional)"
          maxLength={100}
        />
        <Tooltip title="Mover para cima">
          <Button
            type="text"
            icon={<UpOutlined />}
            disabled={bIdx === 0}
            onClick={() => onMove(-1)}
            aria-label="Mover bloco para cima"
          />
        </Tooltip>
        <Tooltip title="Mover para baixo">
          <Button
            type="text"
            icon={<DownOutlined />}
            disabled={bIdx === total - 1}
            onClick={() => onMove(1)}
            aria-label="Mover bloco para baixo"
          />
        </Tooltip>
        <Popconfirm
          title="Remover bloco"
          description="Deseja remover este bloco de texto?"
          onConfirm={onRemove}
          okText="Remover"
          okButtonProps={{ danger: true }}
          cancelText="Cancelar"
        >
          <Tooltip title="Remover bloco">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              aria-label="Remover bloco"
            />
          </Tooltip>
        </Popconfirm>
      </div>

      <div className="block-conditions">
        <div className="block-section-label">Quando incluir</div>
        {conditions.length === 0 ? (
          <div className="block-always">
            Sempre incluído no texto. Adicione uma condição para incluir este
            bloco só a partir de certas respostas.
          </div>
        ) : (
          <>
            {conditions.length > 1 && (
              <div className="block-logic">
                <span>Incluir quando</span>
                <Select
                  value={block.logic}
                  onChange={(logic: any) => onChange({ ...block, logic })}
                  options={LOGIC_OPTIONS}
                  style={{ width: 240 }}
                  aria-label="Combinação das condições"
                />
                <span>forem atendidas:</span>
              </div>
            )}
            {conditions.map((condition, cIdx) => (
              <ConditionRow
                key={cIdx}
                condition={condition}
                groups={groups}
                error={conditionErrors[cIdx]}
                onChange={(next) => updateCondition(cIdx, next)}
                onRemove={() => removeCondition(cIdx)}
              />
            ))}
          </>
        )}
        <Button size="small" icon={<PlusOutlined />} onClick={addCondition}>
          Adicionar condição
        </Button>
      </div>

      <div className="block-section-label">Texto</div>
      <div className="block-variables">
        <VariableMenu
          groups={groups}
          onInsert={(variable) => editorRef.current?.insertContent(variable)}
        />
      </div>
      <Editor
        ref={editorRef}
        content={block.content ?? ""}
        onEdit={(value: string | null) =>
          onChange({ ...block, content: value ?? "" })
        }
      />
      {errors?.content && <div className="form-error">{errors.content}</div>}
    </BlockCard>
  );
}
