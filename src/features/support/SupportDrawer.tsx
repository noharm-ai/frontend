import { Drawer, Avatar, Typography, Space } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

import { useAppDispatch, useAppSelector } from "src/store";
import Button from "components/Button";
import SupportForm from "features/support/SupportForm/SupportForm";
import PermissionService from "src/services/PermissionService";
import {
  setSupportOpen,
  fetchKnowledgeBaseArticles,
  resetKnowledgeBase,
  resetAIForm,
} from "features/support/SupportSlice";
import Permission from "src/models/Permission";
import DefaultModal from "components/Modal";

import { ChatHeader } from "src/features/support/SupportFormAI/SupportFormAI.style";
import { SupportInfo } from "./SupportInfo/SupportInfo";
import { SupportKnowledgeBase } from "./SupportKnowledgeBase/SupportKnowledgeBase";
import { SupportFormAI } from "./SupportFormAI/SupportFormAI";
import { getKnowledgeBasePath } from "./utils/getKnowledgeBasePath";

const { Text } = Typography;

export function SupportDrawer() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const supportDrawerOpen = useAppSelector((state) => state.support.open);
  const pathOverride = useAppSelector(
    (state) => state.support.knowledgeBase.pathOverride,
  );
  const [showForm, setShowForm] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  useEffect(() => {
    if (supportDrawerOpen) {
      const path = pathOverride || getKnowledgeBasePath(location.pathname);
      // @ts-expect-error ts 2554 (legacy code)
      dispatch(fetchKnowledgeBaseArticles({ active: true, path: [path] }));
      setShowForm(false);
    } else {
      dispatch(resetKnowledgeBase());
      setShowForm(false);
    }
  }, [supportDrawerOpen, dispatch, location.pathname, pathOverride]);

  return (
    <Drawer
      open={supportDrawerOpen}
      size="large"
      onClose={() => dispatch(setSupportOpen(false))}
      mask={false}
      title={
        <ChatHeader>
          <Avatar
            size={60}
            src="/imgs/n0-pharma.png"
            style={{
              flexShrink: 0,
              border: "2px solid #FF8845",
            }}
          />
          <h2>Suporte NoHarm</h2>
        </ChatHeader>
      }
      extra={
        <Button
          onClick={() => {
            dispatch(setSupportOpen(false));
            navigate("/suporte");
          }}
        >
          Abrir Central de Ajuda
        </Button>
      }
    >
      {!showForm ? (
        <SupportKnowledgeBase />
      ) : PermissionService().has(Permission.WRITE_SUPPORT) ? (
        <>
          <SupportForm />
        </>
      ) : (
        <SupportInfo />
      )}

      <div
        style={{
          borderTop: "1px solid #f0f0f0",
          paddingTop: "1rem",
        }}
      >
        <Text
          type="secondary"
          style={{ display: "block", marginBottom: 8, fontSize: 13 }}
        >
          Não encontrou o que precisava?
        </Text>
        <Space>
          <Button type="primary" onClick={() => setShowForm(true)}>
            Falar com o suporte
          </Button>
          <Button onClick={() => setAiModalOpen(true)}>
            Consulte o nosso Agente de Suporte (IA)
          </Button>
          <Button
            type="link"
            href={`${import.meta.env.VITE_APP_ODOO_LINK}/knowledge/article/39`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Consultar base de conhecimento
          </Button>
        </Space>
      </div>

      <DefaultModal
        width={700}
        centered
        footer={null}
        open={aiModalOpen}
        destroyOnHidden
        onCancel={() => {
          dispatch(resetAIForm());
          setAiModalOpen(false);
        }}
      >
        <header>
          <h2 className="modal-title">Agente de Suporte (IA)</h2>
        </header>
        <p>
          Tem alguma dúvida? Descreva no campo abaixo e a IA tentará ajudar:
        </p>
        <SupportFormAI mode="simple" />
      </DefaultModal>
    </Drawer>
  );
}
