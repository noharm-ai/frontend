import { Alert, Modal, Tag } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import { useFormikContext } from "formik";

import Button from "components/Button";
import notification from "components/notification";
import {
  parseTriggerExpression,
  serializeTriggerExpression,
} from "components/ProtocolDescription/expressionTree";
import { ProtocolTypeEnum } from "src/models/ProtocolTypeEnum";

import { getVariableSummary } from "../variableSummary";
import { IProtocolFormBaseFields } from "../types";
import { ExpressionSentence } from "../TriggerBuilder/ExpressionSentence";
import { ProposalCardContainer } from "./AgentChat.style";

export interface IAgentProposal {
  name?: string | null;
  protocolType?: number | null;
  config: {
    variables: any[];
    trigger: string;
    result: {
      type?: string;
      level: string;
      message: string;
      description: string;
    };
  };
}

interface IProposalCardProps {
  proposal: IAgentProposal;
}

const levelLabels: Record<string, string> = {
  low: "Baixo",
  medium: "Médio",
  high: "Alto",
};

export function ProposalCard({ proposal }: IProposalCardProps) {
  const { values, setValues } = useFormikContext<IProtocolFormBaseFields>();

  const protocolTypeLabel = ProtocolTypeEnum.getList().find(
    (t: any) => t.value === proposal.protocolType
  )?.label;

  const parsedTree = parseTriggerExpression(proposal.config.trigger).tree;

  const formHasData = Boolean(
    (values.config?.variables ?? []).length > 0 ||
      values.config?.trigger ||
      values.config?.result?.message
  );

  const applyProposal = () => {
    const normalizedTrigger = parsedTree
      ? serializeTriggerExpression(parsedTree)
      : proposal.config.trigger;

    setValues({
      ...values,
      name: values.name || proposal.name || values.name,
      protocolType: values.protocolType ?? proposal.protocolType ?? undefined,
      config: {
        ...values.config,
        variables: proposal.config.variables,
        trigger: normalizedTrigger,
        result: {
          level: proposal.config.result.level,
          message: proposal.config.result.message,
          description: proposal.config.result.description,
        },
      },
    });

    notification.success({
      message: "Proposta aplicada ao formulário. Revise antes de salvar.",
    });
  };

  const handleApply = () => {
    if (formHasData) {
      Modal.confirm({
        title: "Substituir a configuração atual?",
        content:
          "As variáveis, o gatilho e o alerta atuais serão sobrescritos pela proposta.",
        okText: "Substituir",
        cancelText: "Cancelar",
        onOk: applyProposal,
      });
    } else {
      applyProposal();
    }
  };

  return (
    <ProposalCardContainer data-testid="protocol-copilot-proposal">
      <div className="proposal-title">Proposta de protocolo</div>

      <div>
        {proposal.name && <Tag color="blue">{proposal.name}</Tag>}
        {protocolTypeLabel && <Tag>{protocolTypeLabel}</Tag>}
        {proposal.config.result?.level && (
          <Tag
            color={
              proposal.config.result.level === "high"
                ? "red"
                : proposal.config.result.level === "medium"
                  ? "orange"
                  : "green"
            }
          >
            Nível: {levelLabels[proposal.config.result.level] ?? proposal.config.result.level}
          </Tag>
        )}
      </div>

      <div className="proposal-section">
        <span className="proposal-section-label">Variáveis</span>
        <ul className="proposal-variables">
          {proposal.config.variables.map((variable: any, index: number) => (
            <li key={index}>
              <strong>{variable.name}</strong>: {getVariableSummary(variable)}
            </li>
          ))}
        </ul>
      </div>

      <div className="proposal-section">
        <span className="proposal-section-label">Gatilho</span>
        {parsedTree ? (
          <ExpressionSentence
            tree={parsedTree}
            variables={proposal.config.variables}
          />
        ) : (
          <code>{proposal.config.trigger}</code>
        )}
      </div>

      <div className="proposal-section">
        <span className="proposal-section-label">Alerta</span>
        <Alert
          type="info"
          message={proposal.config.result?.message}
          description={proposal.config.result?.description}
        />
      </div>

      <div className="proposal-actions">
        <Button
          type="primary"
          icon={<CheckOutlined />}
          onClick={handleApply}
          id="protocol-copilot-apply"
        >
          Aplicar ao formulário
        </Button>
      </div>
    </ProposalCardContainer>
  );
}
