import { Drawer, Avatar, Typography, Card, Row, Col } from "antd";
import {
  RobotOutlined,
  CustomerServiceOutlined,
  LinkOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
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
import { trackSupportAction, TrackedSupportAction } from "utils/tracker";

import { ChatHeader } from "src/features/support/SupportFormAI/SupportFormAI.style";
import { SupportInfo } from "./SupportInfo/SupportInfo";
import { SupportKnowledgeBase } from "./SupportKnowledgeBase/SupportKnowledgeBase";
import { SupportFormAI } from "./SupportFormAI/SupportFormAI";
import { KnowledgeBasePathEnum } from "src/models/KnowledgeBasePathEnum";

const { Text } = Typography;

export function SupportDrawer() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const supportDrawerOpen = useAppSelector((state) => state.support.open);
  const pathOverride = useAppSelector(
    (state) => state.support.knowledgeBase.pathOverride,
  );
  const kbStatus = useAppSelector(
    (state) => state.support.knowledgeBase.status,
  );
  const kbList = useAppSelector((state) => state.support.knowledgeBase.list);
  const [showForm, setShowForm] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  useEffect(() => {
    if (supportDrawerOpen) {
      const path =
        pathOverride || KnowledgeBasePathEnum.getPath(location.pathname);
      // @ts-expect-error ts 2554 (legacy code)
      dispatch(fetchKnowledgeBaseArticles({ active: true, path: [path] }));
      setShowForm(false);
    } else {
      dispatch(resetKnowledgeBase());
      setShowForm(false);
    }
  }, [supportDrawerOpen, dispatch, location.pathname, pathOverride]);

  const handleOpenSupportAI = () => {
    trackSupportAction(TrackedSupportAction.OPEN_AI_AGENT);
    setAiModalOpen(true);
  };

  const handleOpenSupportForm = () => {
    trackSupportAction(TrackedSupportAction.OPEN_TICKET_FORM);
    setShowForm(true);
  };

  return (
    <Drawer
      open={supportDrawerOpen}
      size="large"
      onClose={() => dispatch(setSupportOpen(false))}
      mask={false}
      styles={{
        header: {
          padding: "0.5rem 1rem",
        },
      }}
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
      ) : (
        <>
          <Button
            type="link"
            icon={<ArrowLeftOutlined />}
            onClick={() => setShowForm(false)}
            style={{ paddingLeft: 0, marginBottom: 8 }}
          >
            Voltar
          </Button>
          {PermissionService().has(Permission.WRITE_SUPPORT) ? (
            <SupportForm />
          ) : (
            <SupportInfo />
          )}
        </>
      )}

      {!showForm && kbStatus === "succeeded" && (
        <div
          style={{
            borderTop: "1px solid #f0f0f0",
            paddingTop: "1rem",
            marginTop: "1rem",
          }}
        >
          {kbList.length > 0 && (
            <Text
              type="secondary"
              style={{ display: "block", marginBottom: 12, fontSize: 13 }}
            >
              Os artigos acima não resolveram seu problema?
            </Text>
          )}
          <Row gutter={12}>
            <Col span={12}>
              <Card
                hoverable
                onClick={() => handleOpenSupportAI()}
                style={{
                  cursor: "pointer",
                  textAlign: "center",
                  borderRadius: 8,
                }}
                styles={{ body: { padding: "16px 12px" } }}
              >
                <RobotOutlined
                  style={{ fontSize: 28, color: "#FF8845", marginBottom: 8 }}
                />
                <div style={{ fontWeight: 600, marginBottom: 4 }}>
                  Suporte IA
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Resposta rápida e automatizada
                </Text>
              </Card>
            </Col>
            <Col span={12}>
              <Card
                hoverable
                onClick={() => handleOpenSupportForm()}
                style={{
                  cursor: "pointer",
                  textAlign: "center",
                  borderRadius: 8,
                }}
                styles={{ body: { padding: "16px 12px" } }}
              >
                <CustomerServiceOutlined
                  style={{ fontSize: 28, color: "#2e3c5a", marginBottom: 8 }}
                />
                <div style={{ fontWeight: 600, marginBottom: 4 }}>
                  Abrir chamado
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Falar com nossa equipe
                </Text>
              </Card>
            </Col>
          </Row>
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <Button
              type="link"
              onClick={() => {
                trackSupportAction(TrackedSupportAction.OPEN_KNOWLEDGE_BASE);
                window.open(
                  `${import.meta.env.VITE_APP_ODOO_LINK}/knowledge/article/39`,
                  "_blank",
                );
              }}
              icon={<LinkOutlined />}
              style={{ fontSize: 12, color: "#8c8c8c" }}
            >
              Consultar base de conhecimento completa
            </Button>
          </div>
        </div>
      )}

      <DefaultModal
        width={850}
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
