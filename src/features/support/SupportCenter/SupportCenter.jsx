import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { MessageOutlined } from "@ant-design/icons";
import { Typography, Row, Col, Tabs } from "antd";

import Button from "components/Button";
import Empty from "components/Empty";
import notification from "components/notification";
import Table from "components/Table";
import { getErrorMessage } from "utils/errorHandler";
import { fetchTickets, setSupportOpen } from "../SupportSlice";
import columns from "./columns";
import expandedRowRender from "./expandedRowRender";
import PermissionService from "services/PermissionService";
import Permission from "models/Permission";

import { PageHeader } from "styles/PageHeader.style";
import { PageCard } from "styles/Utils.style";

function SupportCenter() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const myTickets = useSelector((state) => state.support.tickets.myTickets);
  const following = useSelector((state) => state.support.tickets.following);
  const organization = useSelector(
    (state) => state.support.tickets.organization
  );
  const status = useSelector((state) => state.support.tickets.status);

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
          <h1 className="page-header-title">{t("menu.help")}</h1>
          <h1 className="page-header-legend">
            Consulte os seus chamados de suporte e confira a nossa base de
            conhecimento.
          </h1>
        </div>
      </PageHeader>

      <Row gutter={24}>
        <Col xs={16}>
          <PageCard style={{ marginTop: "0" }}>
            <Tabs defaultActiveKey="1" items={items} />
            <p>* Lista limitada em 50 registros.</p>
          </PageCard>
        </Col>
        <Col xs={8}>
          <Button
            type="primary"
            onClick={() => dispatch(setSupportOpen(true))}
            icon={<MessageOutlined />}
            size="large"
            block
          >
            Abrir um Novo Chamado
          </Button>

          <Typography.Title level={4} style={{ marginTop: "30px" }}>
            Perguntas Frequentes
          </Typography.Title>
          <PageCard style={{ marginTop: "10px" }}>
            <Button
              type="default"
              onClick={() =>
                window.open(
                  `${import.meta.env.VITE_APP_ODOO_LINK}/knowledge/article/182`,
                  "_blank"
                )
              }
              size="large"
              block
              style={{ marginTop: "20px" }}
            >
              Nomes dos Pacientes não aparecem
            </Button>

            <Button
              type="default"
              onClick={() =>
                window.open(
                  `${import.meta.env.VITE_APP_ODOO_LINK}/knowledge/article/111`,
                  "_blank"
                )
              }
              size="large"
              block
              style={{ marginTop: "20px" }}
            >
              Escore 4: o que fazer?
            </Button>

            <Button
              type="default"
              onClick={() =>
                window.open(
                  `${import.meta.env.VITE_APP_ODOO_LINK}/knowledge/article/131`,
                  "_blank"
                )
              }
              size="large"
              block
              style={{ marginTop: "20px" }}
            >
              Divisor de faixas
            </Button>

            <Button
              type="primary"
              onClick={() =>
                window.open(
                  `${import.meta.env.VITE_APP_ODOO_LINK}/knowledge/article/39`,
                  "_blank"
                )
              }
              size="large"
              block
              style={{ marginTop: "20px" }}
            >
              Ver todas
            </Button>
          </PageCard>
        </Col>
      </Row>
    </>
  );
}

export default SupportCenter;
