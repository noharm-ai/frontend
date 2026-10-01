import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  AimOutlined,
  BookOutlined,
  CustomerServiceOutlined,
  FileTextOutlined,
  MessageOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import { Avatar, Row, Col, Switch, Tabs } from "antd";

import Button from "components/Button";
import Empty from "components/Empty";
import notification from "components/notification";
import Table from "components/Table";
import { getErrorMessage } from "utils/errorHandler";
import { setHelpModeActive } from "features/knowledgeBase/HelpMode/HelpModeSlice";
import { trackSupportAction, TrackedSupportAction } from "utils/tracker";
import { fetchTickets, setSupportOpen } from "../SupportSlice";
import { SupportAIModal } from "../SupportAIModal/SupportAIModal";
import columns from "./columns";
import expandedRowRender from "./expandedRowRender";
import PermissionService from "services/PermissionService";
import Permission from "models/Permission";

import { PageHeader } from "styles/PageHeader.style";
import { PageCard } from "styles/Utils.style";
import {
  AIAgentCard,
  HelpModeSection,
  ActionCard,
} from "./SupportCenter.style";

function SupportCenter() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const myTickets = useSelector((state) => state.support.tickets.myTickets);
  const following = useSelector((state) => state.support.tickets.following);
  const organization = useSelector(
    (state) => state.support.tickets.organization,
  );
  const status = useSelector((state) => state.support.tickets.status);
  const helpModeActive = useSelector((state) => state.helpMode.active);

  const emptyText = (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={t("errors.empty")}
    />
  );

  useEffect(() => {
    dispatch(fetchTickets()).then((response) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      }
    });
  }, [dispatch, t]);

  const items = [
    {
      key: "1",
      label: "Meus chamados",
      children: (
        <Table
          columns={columns(t)}
          pagination={false}
          loading={status === "loading"}
          locale={{ emptyText }}
          dataSource={myTickets}
          rowKey="id"
          expandedRowRender={expandedRowRender}
        />
      ),
    },
    {
      key: "2",
      label: "Seguindo",
      children: (
        <Table
          columns={columns(t)}
          pagination={false}
          loading={status === "loading"}
          locale={{ emptyText }}
          dataSource={following}
          rowKey="id"
          expandedRowRender={expandedRowRender}
        />
      ),
    },
  ];

  if (PermissionService().has(Permission.ADMIN_SUPPORT)) {
    items.push({
      key: "3",
      label: "Minha organização",
      children: (
        <Table
          columns={columns(t)}
          pagination={false}
          loading={status === "loading"}
          locale={{ emptyText }}
          dataSource={organization}
          rowKey="id"
          expandedRowRender={expandedRowRender}
        />
      ),
    });
  }

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title" data-kb="support.title">
            {t("menu.help")}
          </h1>
          <h1 className="page-header-legend">
            Consulte os seus chamados de suporte e confira a nossa base de
            conhecimento.
          </h1>
        </div>
      </PageHeader>

      <Row gutter={24}>
        <Col xs={24} lg={16}>
          <PageCard style={{ marginTop: "0" }}>
            <Tabs defaultActiveKey="1" items={items} />
            <p>* Lista limitada em 50 registros.</p>
          </PageCard>
        </Col>
        <Col xs={24} lg={8}>
          <AIAgentCard data-kb="support.aiAgent">
            <div className="ai-header">
              <Avatar
                size={56}
                src="/imgs/n0-pharma.png"
                style={{ flexShrink: 0, border: "2px solid #FF8845" }}
              />
              <div>
                <span className="ai-eyebrow">IA</span>
                <h2>Pergunte ao Agente de Suporte</h2>
              </div>
            </div>
            <p>
              Tire dúvidas sobre a NoHarm a qualquer hora, com respostas
              baseadas na nossa base de conhecimento.
            </p>
            <Button
              type="primary"
              size="large"
              icon={<RobotOutlined />}
              block
              onClick={() => {
                trackSupportAction(TrackedSupportAction.OPEN_AI_AGENT);
                setAiModalOpen(true);
              }}
            >
              Conversar com o Agente IA
            </Button>
          </AIAgentCard>

          <ActionCard data-kb="support.knowledgeBase">
            <div className="action-header">
              <span className="action-icon" aria-hidden="true">
                <BookOutlined />
              </span>
              <div>
                <strong className="action-title">Base de Conhecimento</strong>
                <span className="action-hint">
                  Artigos e tutoriais para usar a NoHarm.
                </span>
              </div>
            </div>
            <Button
              onClick={() => navigate("/base-de-conhecimento")}
              icon={<FileTextOutlined />}
              size="large"
              block
            >
              Acessar a Base de Conhecimento
            </Button>
            <HelpModeSection data-kb="support.helpMode">
              <div className="help-mode-header">
                <AimOutlined className="help-mode-icon" />
                <label htmlFor="support-help-mode">Modo ajuda</label>
                <Switch
                  id="support-help-mode"
                  checked={helpModeActive}
                  onChange={(checked) => dispatch(setHelpModeActive(checked))}
                />
              </div>
              <p>
                Destaca os elementos que têm artigos da base de conhecimento.
                Clique em um destaque para ler a explicação. Funciona em
                qualquer tela.
              </p>
            </HelpModeSection>
          </ActionCard>

          <ActionCard data-kb="support.newTicket">
            <div className="action-header">
              <span className="action-icon" aria-hidden="true">
                <CustomerServiceOutlined />
              </span>
              <div>
                <strong className="action-title">
                  Precisa falar com a nossa equipe?
                </strong>
                <span className="action-hint">
                  Abra um chamado e acompanhe por aqui.
                </span>
              </div>
            </div>
            <Button
              onClick={() => dispatch(setSupportOpen(true))}
              icon={<MessageOutlined />}
              size="large"
              block
            >
              Abrir um Novo Chamado
            </Button>
          </ActionCard>
        </Col>
      </Row>

      <SupportAIModal
        open={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
      />
    </>
  );
}

export default SupportCenter;
