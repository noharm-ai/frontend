import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Drawer, Input, Spin } from "antd";
import { SendOutlined } from "@ant-design/icons";
import { useFormikContext } from "formik";

import api from "services/api";
import Button from "components/Button";
import notification from "components/notification";
import { getErrorMessageFromException } from "utils/errorHandler";

import { IProtocolFormBaseFields } from "../types";
import { AgentChatMessage, IAgentChatMessage } from "./AgentChatMessage";
import { ChatContainer, ChatMessages, ChatInputRow } from "./AgentChat.style";

interface IAgentChatDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function AgentChatDrawer({ open, onClose }: IAgentChatDrawerProps) {
  const { t } = useTranslation();
  const { values } = useFormikContext<IProtocolFormBaseFields>();

  const [messages, setMessages] = useState<IAgentChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const transcript = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    setMessages((current) => [...current, { role: "user", content: text }]);
    setInput("");
    setLoading(true);

    try {
      const response = await api.protocols.aiAgentChat({
        messages: transcript,
        draft: {
          name: values.name || null,
          protocolType: values.protocolType ?? null,
          config: values.config ?? null,
        },
        message: text,
      });
      const data = response.data.data;

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: data.message,
          proposal: data.proposal,
          proposalErrors: data.proposalErrors ?? [],
        },
      ]);
    } catch (error: any) {
      notification.error({
        message: getErrorMessageFromException(error?.response?.data, t),
      });
    }

    setLoading(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  };

  return (
    <Drawer
      title="Copiloto IA"
      open={open}
      onClose={onClose}
      width={520}
      forceRender
      styles={{ body: { display: "flex", flexDirection: "column" } }}
    >
      <ChatContainer>
        <ChatMessages>
          {messages.length === 0 && (
            <div className="chat-empty">
              Descreva o protocolo que você quer criar. Ex.: "alertar quando
              paciente idoso estiver em uso de vancomicina com creatinina
              elevada". O copiloto faz perguntas, busca substâncias e exames
              reais e monta as variáveis, o gatilho e o alerta para você
              revisar.
            </div>
          )}

          {messages.map((message, index) => (
            <AgentChatMessage key={index} message={message} />
          ))}

          {loading && (
            <div>
              <Spin size="small" /> <span>Pensando...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </ChatMessages>

        <ChatInputRow>
          <Input.TextArea
            id="protocol-copilot-input"
            value={input}
            onChange={({ target }) => setInput(target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Descreva o protocolo ou responda ao copiloto"
            autoSize={{ minRows: 1, maxRows: 4 }}
            maxLength={2000}
            disabled={loading}
          />
          <Button
            id="protocol-copilot-send"
            type="primary"
            icon={<SendOutlined />}
            onClick={send}
            loading={loading}
            disabled={!input.trim()}
          />
        </ChatInputRow>
      </ChatContainer>
    </Drawer>
  );
}
