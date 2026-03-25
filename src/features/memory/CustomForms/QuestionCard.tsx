import React from "react";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Tag, Tooltip } from "antd";

import Editor from "components/Editor";
import { Input, Select } from "components/Inputs";
import Button from "components/Button";
import { QuestionCard as StyledQuestionCard } from "./CustomFormEditor.style";
import { Question, questionTypeOptions } from "./types";

interface QuestionCardProps {
  q: Question;
  qIdx: number;
  gIdx: number;
  canRemove: boolean;
  errors: any;
  groupQuestions: Question[];
  onUpdate: (gIdx: number, qIdx: number, field: string, value: any) => void;
  onRemove: (gIdx: number, qIdx: number) => void;
}

export function QuestionCard({
  q,
  qIdx,
  gIdx,
  canRemove,
  errors,
  groupQuestions,
  onUpdate,
  onRemove,
}: QuestionCardProps) {
  const showOptions = q.type === "options" || q.type === "options-multiple";
  const showKeyValueOptions =
    q.type === "options-key-value" || q.type === "options-key-value-multiple";
  const isCalculatedField = q.type === "calculated_field";
  const [showHelp, setShowHelp] = React.useState(!!(q.help || q.helpDetails));

  const keyValueOptions = (
    (q.options ?? []) as { id: string; value: string }[]
  ).filter((o) => typeof o === "object");

  const availableForFormula = groupQuestions.filter(
    (gq) =>
      gq !== q && (gq.type === "number" || gq.type === "options-key-value"),
  );

  return (
    <StyledQuestionCard>
      <div className="form-row">
        <div className="form-label">
          <label>ID:</label>
        </div>
        <div className="form-input">
          <Input
            value={q.id}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onUpdate(gIdx, qIdx, "id", e.target.value.replace(/ /g, ""))
            }
            maxLength={100}
            placeholder="identificador-unico"
          />
        </div>
        {errors.id && <div className="form-error">{errors.id}</div>}
      </div>

      <div className="form-row">
        <div className="form-label">
          <label>Pergunta:</label>
        </div>
        <div className="form-input">
          <Input
            value={q.label}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onUpdate(gIdx, qIdx, "label", e.target.value)
            }
            placeholder="Texto da pergunta"
          />
        </div>
        {errors.label && <div className="form-error">{errors.label}</div>}
      </div>

      <div className="form-row form-row-flex">
        <div className="form-row">
          <div className="form-label">
            <label>Tipo:</label>
          </div>
          <div className="form-input">
            <Select
              value={q.type}
              onChange={(value: any) => onUpdate(gIdx, qIdx, "type", value)}
              options={questionTypeOptions}
            />
          </div>
        </div>
      </div>

      {showOptions && (
        <div className="form-row">
          <div className="form-label">
            <label>Opções:</label>
          </div>
          <div className="form-input">
            <Select
              mode="tags"
              style={{ maxWidth: "430px" }}
              value={q.options ?? []}
              onChange={(value: any) => onUpdate(gIdx, qIdx, "options", value)}
              tokenSeparators={[","]}
              placeholder="Digite e pressione Enter para adicionar opções"
              notFoundContent={null}
            />
          </div>
        </div>
      )}

      {showKeyValueOptions && (
        <div className="form-row">
          <div className="form-label">
            <label>Opções (chave-valor):</label>
          </div>
          <div className="form-input">
            {keyValueOptions.map((opt, idx) => (
              <div
                key={idx}
                style={{ display: "flex", gap: 8, marginBottom: 8 }}
              >
                <Input
                  placeholder="ID"
                  value={opt.id}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const updated = [...keyValueOptions];
                    updated[idx] = { ...opt, id: e.target.value };
                    onUpdate(gIdx, qIdx, "options", updated);
                  }}
                  style={{ width: 140 }}
                />
                <Input
                  placeholder="Valor"
                  value={opt.value}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const updated = [...keyValueOptions];
                    updated[idx] = { ...opt, value: e.target.value };
                    onUpdate(gIdx, qIdx, "options", updated);
                  }}
                  style={{ width: 220 }}
                />
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => {
                    const updated = keyValueOptions.filter((_, i) => i !== idx);
                    onUpdate(gIdx, qIdx, "options", updated);
                  }}
                />
              </div>
            ))}
            <Button
              icon={<PlusOutlined />}
              onClick={() =>
                onUpdate(gIdx, qIdx, "options", [
                  ...keyValueOptions,
                  { id: "", value: "" },
                ])
              }
            >
              Adicionar opção
            </Button>
          </div>
        </div>
      )}

      {isCalculatedField && (
        <div className="form-row">
          <div className="form-label">
            <label>Fórmula:</label>
          </div>
          <div className="form-input">
            <Input
              value={q.formula ?? ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onUpdate(gIdx, qIdx, "formula", e.target.value)
              }
              placeholder="Ex: {{peso}} + {{altura}} * 2"
            />
            {availableForFormula.length > 0 && (
              <div
                style={{
                  marginTop: 6,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 4,
                }}
              >
                {availableForFormula.map((aq) => (
                  <Tag
                    key={aq.id}
                    variant="outlined"
                    style={{ cursor: "pointer", marginBottom: 4 }}
                    onClick={() =>
                      onUpdate(
                        gIdx,
                        qIdx,
                        "formula",
                        q.formula
                          ? `${q.formula} {{${aq.id}}}`
                          : `{{${aq.id}}}`,
                      )
                    }
                  >
                    <Tooltip title={aq.label}>{aq.id}</Tooltip>
                  </Tag>
                ))}
              </div>
            )}
            <div style={{ fontSize: 11, color: "#999", marginTop: 4 }}>
              Use os IDs das questões como variáveis. Ex:{" "}
              <code>{"{{peso}} + {{altura}} * 2"}</code>
            </div>
          </div>
          {errors.formula && <div className="form-error">{errors.formula}</div>}
        </div>
      )}

      <div className="form-row">
        <a style={{ fontSize: 12 }} onClick={() => setShowHelp((v) => !v)}>
          {showHelp ? "Ocultar ajuda" : "Adicionar ajuda"}
        </a>
      </div>

      {showHelp && (
        <>
          <div className="form-row">
            <div className="form-label">
              <label>Ajuda:</label>
            </div>
            <div className="form-input">
              <Input
                value={q.help ?? ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onUpdate(gIdx, qIdx, "help", e.target.value)
                }
                placeholder="Texto de ajuda para o preenchimento"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-label">
              <label>Ajuda detalhada:</label>
            </div>
            <div className="form-input">
              <Editor
                content={q.helpDetails ?? ""}
                onEdit={(value: string | null) =>
                  onUpdate(gIdx, qIdx, "helpDetails", value ?? "")
                }
              />
            </div>
          </div>
        </>
      )}

      <div className="form-row">
        <Button
          danger
          block
          icon={<DeleteOutlined />}
          onClick={() => onRemove(gIdx, qIdx)}
          disabled={!canRemove}
        >
          Remover Questão
        </Button>
      </div>
    </StyledQuestionCard>
  );
}
