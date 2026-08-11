import { Alert } from "antd";
import DOMPurify from "dompurify";

import { ProposalCard, IAgentProposal } from "./ProposalCard";
import { ChatBubble } from "./AgentChat.style";

// Kept in sync with the tag list the agent is instructed to emit
// (AGENT_SYSTEM_PROMPT, backend). Anything else is unwrapped by DOMPurify,
// which keeps the text but loses the formatting.
const ALLOWED_TAGS = ["p", "br", "strong", "em", "ul", "ol", "li", "code"];

// A bare "<" is common in this domain ("creatinina < 2"), so look for something
// tag-shaped instead of just any "<".
const HAS_TAG = /<\/?[a-z][^>]*>/i;

const toSafeHtml = (content: string) => {
  // The agent answers in simple HTML, but a turn can still come back as plain
  // text — in that case keep at least its line breaks.
  const html = HAS_TAG.test(content)
    ? content
    : content.replace(/(?:\r\n|\r|\n)/g, "<br>");

  return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR: [] });
};

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
      {message.role === "assistant" ? (
        <div
          className="bubble-content"
          dangerouslySetInnerHTML={{ __html: toSafeHtml(message.content) }}
        />
      ) : (
        message.content
      )}

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
