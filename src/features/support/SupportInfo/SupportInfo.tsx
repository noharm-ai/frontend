import { useEffect } from "react";
import { Alert, Button, Spin, Divider } from "antd";

import { useAppDispatch, useAppSelector } from "src/store";
import {
  ChatContainer,
  ChatBubble,
  ActionSection,
} from "../SupportFormAI/SupportFormAI.style";
import { fetchRequesters } from "../SupportSlice";

export function SupportInfo() {
  const dispatch = useAppDispatch();
  const listRequesters = useAppSelector(
    (state) => state.support.fetchRequesters.list
  );
  const status = useAppSelector(
    (state) => state.support.fetchRequesters.status
  );
  const supportDrawerOpen = useAppSelector((state) => state.support.open);

  useEffect(() => {
    if (supportDrawerOpen) {
      dispatch(fetchRequesters());
    }
  }, [dispatch, supportDrawerOpen]);

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
        </ActionSection>
      </ChatBubble>
    </ChatContainer>
  );
}
