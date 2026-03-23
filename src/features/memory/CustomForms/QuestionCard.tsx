import React from "react";
import { DeleteOutlined } from "@ant-design/icons";

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
  onUpdate: (gIdx: number, qIdx: number, field: string, value: any) => void;
  onRemove: (gIdx: number, qIdx: number) => void;
}

export function QuestionCard({
  q,
  qIdx,
  gIdx,
  canRemove,
  errors,
  onUpdate,
  onRemove,
}: QuestionCardProps) {
  const showOptions = q.type === "options" || q.type === "options-multiple";
  const [showHelp, setShowHelp] = React.useState(!!(q.help || q.helpDetails));

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
