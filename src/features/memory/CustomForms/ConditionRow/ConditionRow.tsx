import { DeleteOutlined } from "@ant-design/icons";

import { Input, InputNumber, Select } from "components/Inputs";
import Button from "components/Button";
import Tooltip from "components/Tooltip";

import { ConditionLine } from "../CustomTextBody/CustomTextBody.style";
import {
  OPERATOR_LABELS,
  isOptionQuestion,
  operatorNeedsValue,
  operatorsForType,
  questionOptions,
} from "../customText";
import { FormGroup, TextCondition } from "../types";

interface ConditionRowProps {
  condition: TextCondition;
  groups: FormGroup[];
  error?: string;
  onChange: (condition: TextCondition) => void;
  onRemove: () => void;
}

/** One condition of a text block: question, rule and value. */
export function ConditionRow({
  condition,
  groups,
  error,
  onChange,
  onRemove,
}: ConditionRowProps) {
  const questions = groups.flatMap((g) => g.questions ?? []);
  const question = questions.find((q) => q.id === condition.questionId);
  const operators = question ? operatorsForType(question.type) : [];

  const questionSelectOptions = groups
    .map((group, gIdx) => ({
      label: group.group || `Grupo ${gIdx + 1}`,
      title: group.group || `Grupo ${gIdx + 1}`,
      options: (group.questions ?? [])
        .filter((q) => q.id)
        .map((q) => ({
          value: q.id,
          label: q.label ? `${q.label} (${q.id})` : q.id,
        })),
    }))
    .filter((group) => group.options.length > 0);

  // a question removed from the form stays visible, so the error makes sense
  if (condition.questionId && !question) {
    questionSelectOptions.push({
      label: "Removida do formulário",
      title: "Removida do formulário",
      options: [
        { value: condition.questionId, label: condition.questionId },
      ],
    });
  }

  const changeQuestion = (questionId: string) => {
    const next = questions.find((q) => q.id === questionId);
    const nextOperators = next ? operatorsForType(next.type) : [];
    // the rule and the value only carry over to a question that takes them
    const keepOperator =
      condition.operator !== "" &&
      nextOperators.includes(condition.operator) &&
      next?.type === question?.type;
    onChange({
      questionId,
      operator: keepOperator ? condition.operator : nextOperators[0] ?? "",
      value: keepOperator ? condition.value ?? null : null,
    });
  };

  const changeOperator = (operator: TextCondition["operator"]) => {
    onChange({
      ...condition,
      operator,
      value: operatorNeedsValue(operator) ? condition.value ?? null : null,
    });
  };

  const renderValue = () => {
    if (!question || !operatorNeedsValue(condition.operator)) return null;

    if (isOptionQuestion(question)) {
      return (
        <Select
          className="condition-value"
          placeholder="Opção"
          value={condition.value ?? undefined}
          onChange={(value: any) => onChange({ ...condition, value })}
          options={questionOptions(question)}
          showSearch
          optionFilterProp="label"
          aria-label="Valor da condição"
        />
      );
    }

    if (question.type === "number" || question.type === "calculated_field") {
      return (
        <InputNumber
          className="condition-value"
          placeholder="Valor"
          value={condition.value ?? null}
          onChange={(value: number | null) =>
            onChange({ ...condition, value })
          }
          aria-label="Valor da condição"
        />
      );
    }

    return (
      <Input
        className="condition-value"
        placeholder="Valor"
        value={condition.value ?? ""}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange({ ...condition, value: e.target.value })
        }
        aria-label="Valor da condição"
      />
    );
  };

  return (
    <ConditionLine data-testid="text-condition">
      <div className="condition-fields">
        <Select
          className="condition-question"
          placeholder="Questão"
          value={condition.questionId || undefined}
          onChange={(value: any) => changeQuestion(value)}
          options={questionSelectOptions}
          showSearch
          optionFilterProp="label"
          aria-label="Questão da condição"
        />
        <Select
          className="condition-operator"
          placeholder="Regra"
          value={condition.operator || undefined}
          onChange={(value: any) => changeOperator(value)}
          disabled={!question}
          options={operators.map((op) => ({
            value: op,
            label: OPERATOR_LABELS[op],
          }))}
          aria-label="Regra da condição"
        />
        {renderValue()}
        <Tooltip title="Remover condição">
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={onRemove}
            aria-label="Remover condição"
          />
        </Tooltip>
      </div>
      {error && <div className="form-error">{error}</div>}
    </ConditionLine>
  );
}
