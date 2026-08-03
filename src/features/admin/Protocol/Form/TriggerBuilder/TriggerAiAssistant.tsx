import { useState } from "react";
import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import { Alert, Input } from "antd";
import { AuditOutlined, RobotOutlined } from "@ant-design/icons";

import api from "services/api";
import Button from "components/Button";
import Tooltip from "components/Tooltip";
import notification from "components/notification";
import { getErrorMessageFromException } from "utils/errorHandler";
import { getVariableSummary } from "../variableSummary";
import { IProtocolFormBaseFields } from "../types";
import {
  parseTriggerExpression,
  serializeTriggerExpression,
} from "./expressionTree";
import { ExpressionSentence } from "./ExpressionSentence";
import { AiAssistant } from "./TriggerBuilder.style";

interface IGenerateResult {
  applied: boolean;
  explanation: string;
}

interface IReviewFinding {
  severity: "error" | "warning" | "info";
  message: string;
}

interface IReviewResult {
  verdict: "ok" | "attention";
  summary: string;
  findings: IReviewFinding[];
}

export function TriggerAiAssistant() {
  const { t } = useTranslation();
  const { values, setFieldValue } =
    useFormikContext<IProtocolFormBaseFields>();

  const [hint, setHint] = useState("");
  const [generating, setGenerating] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [generateResult, setGenerateResult] = useState<IGenerateResult | null>(
    null
  );
  const [review, setReview] = useState<IReviewResult | null>(null);

  const trigger = values.config?.trigger ?? "";

  const variablesPayload = () =>
    (values.config?.variables ?? [])
      .filter((v: any) => v.name)
      .map((v: any) => ({
        name: v.name,
        summary: getVariableSummary(v).slice(0, 300),
      }));

  const hasVariables = variablesPayload().length > 0;
  const parsedTree = parseTriggerExpression(trigger).tree;

  const applyTrigger = (generated: string): boolean => {
    const result = parseTriggerExpression(generated);

    if (!result.tree) {
      return false;
    }

    setFieldValue("config.trigger", serializeTriggerExpression(result.tree));
    return true;
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setGenerateResult(null);
    setReview(null);

    try {
      const response = await api.protocols.aiGenerateTrigger({
        hint: hint.trim(),
        variables: variablesPayload(),
        currentTrigger: trigger || null,
      });
      const data = response.data.data;

      if (!data.trigger) {
        setGenerateResult({ applied: false, explanation: data.explanation });
      } else if (applyTrigger(data.trigger)) {
        setGenerateResult({ applied: true, explanation: data.explanation });
      } else {
        notification.error({
          message:
            "A expressão gerada não pôde ser interpretada. Tente novamente.",
        });
      }
    } catch (error: any) {
      notification.error({
        message: getErrorMessageFromException(error?.response?.data, t),
      });
    }

    setGenerating(false);
  };

  const handleReview = async () => {
    setReviewing(true);
    setGenerateResult(null);
    setReview(null);

    try {
      const response = await api.protocols.aiReviewTrigger({
        trigger,
        variables: variablesPayload(),
        resultMessage: values.config?.result?.message || null,
        resultDescription: values.config?.result?.description || null,
      });

      setReview(response.data.data);
    } catch (error: any) {
      notification.error({
        message: getErrorMessageFromException(error?.response?.data, t),
      });
    }

    setReviewing(false);
  };

  return (
    <AiAssistant>
      {parsedTree && (
        <ExpressionSentence
          tree={parsedTree}
          variables={values.config?.variables ?? []}
        />
      )}

      <div className="ai-row">
        <Input.TextArea
          id="protocol-ai-hint"
          value={hint}
          onChange={({ target }) => setHint(target.value)}
          placeholder="Descreva a regra em linguagem natural. Ex.: paciente idoso em uso de antimicrobiano, exceto profilaxia"
          autoSize={{ minRows: 1, maxRows: 3 }}
          maxLength={500}
          disabled={generating}
        />
      </div>

      <div className="ai-actions">
        <Tooltip
          title={!hasVariables ? "Cadastre variáveis antes de gerar" : undefined}
        >
          <Button
            id="protocol-ai-generate"
            type="primary"
            ghost
            icon={<RobotOutlined />}
            loading={generating}
            disabled={!hasVariables || !hint.trim() || reviewing}
            onClick={handleGenerate}
          >
            Gerar expressão
          </Button>
        </Tooltip>
        <Tooltip
          title={!trigger ? "Monte uma expressão antes de revisar" : undefined}
        >
          <Button
            id="protocol-ai-review"
            icon={<AuditOutlined />}
            loading={reviewing}
            disabled={!trigger || !hasVariables || generating}
            onClick={handleReview}
          >
            Revisar expressão
          </Button>
        </Tooltip>
      </div>

      {(generateResult || review) && (
        <div className="ai-results">
          {generateResult && (
            <Alert
              type={generateResult.applied ? "success" : "warning"}
              showIcon
              closable
              onClose={() => setGenerateResult(null)}
              message={
                generateResult.applied
                  ? "Expressão gerada e aplicada ao construtor."
                  : "Não foi possível montar a expressão."
              }
              description={generateResult.explanation || undefined}
            />
          )}
          {review && (
            <>
              <Alert
                type={review.verdict === "ok" ? "success" : "warning"}
                showIcon
                closable
                onClose={() => setReview(null)}
                message={
                  review.verdict === "ok"
                    ? "A expressão parece consistente."
                    : "A expressão merece atenção."
                }
                description={review.summary || undefined}
              />
              {review.findings.map((finding, index) => (
                <Alert
                  key={index}
                  type={finding.severity}
                  showIcon
                  message={finding.message}
                />
              ))}
            </>
          )}
        </div>
      )}
    </AiAssistant>
  );
}
