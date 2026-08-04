import { Alert } from "antd";

import { ProposalCard, IAgentProposal } from "./ProposalCard";
import { ChatBubble } from "./AgentChat.style";

export interface IAgentChatMessage {
  role: "user" | "assistant";
  content: string;
  proposal?: IAgentProposal | null;
  proposalErrors?: string[];
}

interface IAgentChatMessageProps {
  message: IAgentChatMessage;
}

export function AgentChatMessage({ message }: IAgentChatMessageProps) {
  const hasExtras =
    message.proposal || (message.proposalErrors ?? []).length > 0;

  return (
    <ChatBubble $role={message.role} data-testid={`chat-${message.role}`}>
      {message.content}

      {hasExtras && (
        <div className="bubble-extras">
          {(message.proposalErrors ?? []).map((error, index) => (
            <Alert key={index} type="warning" showIcon message={error} />
          ))}
          {message.proposal && <ProposalCard proposal={message.proposal} />}
        </div>
      )}
    </ChatBubble>
  );
}
