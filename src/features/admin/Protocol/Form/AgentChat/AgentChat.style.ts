import styled from "styled-components";

export const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-bottom: 1rem;

  .chat-empty {
    color: rgba(0, 0, 0, 0.45);
    font-size: 0.9rem;
    padding: 1rem 0.5rem;
  }
`;

export const ChatBubble = styled.div<{ $role: "user" | "assistant" }>`
  max-width: 92%;
  align-self: ${({ $role }) => ($role === "user" ? "flex-end" : "flex-start")};
  background: ${({ $role }) => ($role === "user" ? "#e6f4ff" : "#f5f5f5")};
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  /* user messages are plain text from a textarea and keep their line breaks;
     assistant messages are HTML and bring their own block layout */
  white-space: ${({ $role }) => ($role === "user" ? "pre-wrap" : "normal")};
  word-break: break-word;
  font-size: 0.9rem;

  .bubble-content {
    p,
    ul,
    ol {
      margin: 0 0 0.5rem;
    }

    ul,
    ol {
      padding-left: 1.25rem;
    }

    li {
      margin-bottom: 0.15rem;
    }

    code {
      background: rgba(0, 0, 0, 0.06);
      border-radius: 4px;
      padding: 0.05rem 0.25rem;
      font-size: 0.85em;
    }

    > *:first-child {
      margin-top: 0;
    }

    > *:last-child {
      margin-bottom: 0;
    }
  }

  .bubble-extras {
    margin-top: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
`;

export const ChatInputRow = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(0, 0, 0, 0.08);

  textarea {
    flex: 1;
  }
`;

export const ProposalCardContainer = styled.div`
  border: 1px solid #91caff;
  border-radius: 8px;
  background: #fff;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  .proposal-title {
    font-weight: 600;
  }

  .proposal-section {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    .proposal-section-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      color: rgba(0, 0, 0, 0.45);
    }
  }

  .proposal-variables {
    margin: 0;
    padding-left: 1.25rem;

    li {
      font-size: 0.85rem;
    }
  }

  .proposal-actions {
    display: flex;
    justify-content: flex-end;
  }
`;
