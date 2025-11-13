import { useEffect, useState } from "react";
import { Alert, Button, Spin, Space, Divider } from "antd";

import { useAppDispatch, useAppSelector } from "src/store";
import {
  ChatContainer,
  ChatBubble,
  ActionSection,
} from "../SupportFormAI/SupportFormAI.style";
import { fetchRequesters, resetAIForm } from "../SupportSlice";
import DefaultModal from "components/Modal";
import { SupportFormAI } from "../SupportFormAI/SupportFormAI";

export function SupportInfo() {
  const dispatch = useAppDispatch();
  const listRequesters = useAppSelector(
    (state) => state.support.fetchRequesters.list
  );
  const status = useAppSelector(
    (state) => state.support.fetchRequesters.status
  );
  const supportDrawerOpen = useAppSelector((state) => state.support.open);
  const [supportFormOpen, setSupportOpen] = useState(false);

  useEffect(() => {
    if (supportDrawerOpen) {
      dispatch(fetchRequesters());
    }
  }, [dispatch, supportDrawerOpen]);

  const cancelSupportForm = () => {
    dispatch(resetAIForm());
    setSupportOpen(false);
  };

  return (
    <ChatContainer>
      <ChatBubble>
        <Spin spinning={status === "loading"}>
          <p>
            <strong>Olá! Seja bem-vindo(a) ao nosso suporte.</strong>
          </p>
          <p>
            Você não possui permissão para criar novos chamados. Para abrir um
            chamado, entre em contato com um dos seus colegas listados abaixo
            para que possam fazer a abertura para você:
          </p>
          {listRequesters.length > 0 ? (
            <div style={{ marginTop: "25px" }}>
              <strong>Usuários autorizados a abrir chamados:</strong>
              <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
                {listRequesters.map((user: any, index: number) => (
                  <li key={index} style={{ marginBottom: "4px" }}>
                    <strong>{user.name}</strong> ({user.email})
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <Alert
              type="error"
              showIcon
              message="Nenhum usuário autorizado a criar chamados"
              description={`Entre em contato através do email ${
                import.meta.env.VITE_APP_SUPPORT_EMAIL
              }`}
            />
          )}
        </Spin>

        <Divider />

        <ActionSection>
          <Space>
            <Button
              type="default"
              href={`${
                import.meta.env.VITE_APP_ODOO_LINK
              }/knowledge/article/39`}
              target="_blank"
              rel="noreferer noopener"
            >
              Consulte a Base de Conhecimento
            </Button>
            <Button type="primary" onClick={() => setSupportOpen(true)}>
              Consulte o nosso Agente de Suporte (IA)
            </Button>
          </Space>
        </ActionSection>
      </ChatBubble>

      <DefaultModal
        width={700}
        centered
        footer={null}
        open={supportFormOpen}
        destroyOnClose
        onCancel={() => cancelSupportForm()}
      >
        <header>
          <h2 className="modal-title">Agente de Suporte (IA)</h2>
        </header>
        <p>
          Tem alguma dúvida? Descreva no campo abaixo e a IA tentará ajudar:
        </p>
        <SupportFormAI mode="simple" />
      </DefaultModal>
    </ChatContainer>
  );
}
