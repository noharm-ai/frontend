import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { MessageOutlined } from "@ant-design/icons";
import { Typography, Row, Col } from "antd";

import Button from "components/Button";
import Empty from "components/Empty";
import notification from "components/notification";
import Table from "components/Table";
import { getErrorMessage } from "utils/errorHandler";
import { toDataSource } from "utils";
import { fetchTickets, setSupportOpen, reset } from "../SupportSlice";
import columns from "./columns";
import expandedRowRender from "./expandedRowRender";

import { PageHeader } from "styles/PageHeader.style";
import { PageCard, PageContainer } from "styles/Utils.style";

const filterList = (ds, filter) => {
  if (!ds) return [];

  return ds.filter((i) => {
    let show = true;

    return show;
  });
};

function SupportCenter() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const list = useSelector((state) => state.support.tickets.list);
  const status = useSelector((state) => state.support.tickets.status);
  const [filter] = useState({
    status: null,
    fl: [],
  });

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

    return () => {
      dispatch(reset());
    };
  }, [dispatch, t]);

  const ds = toDataSource(filterList(list, filter), null, {});

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
      <PageContainer>
        <Row gutter={24}>
          <Col xs={16}>
            <Typography.Title level={4} style={{ marginTop: 0 }}>
              Meus Chamados de Suporte
            </Typography.Title>
            <PageCard style={{ marginTop: "10px" }}>
              <Table
                columns={columns(t)}
                pagination={false}
                loading={status === "loading"}
                locale={{ emptyText }}
                dataSource={ds || []}
                expandedRowRender={expandedRowRender}
              />
            </PageCard>
          </Col>
          <Col xs={8}>
            <Button
              type="primary"
              onClick={() => dispatch(setSupportOpen(true))}
              icon={<MessageOutlined />}
              size="large"
              block
              style={{ marginTop: "37px" }}
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
                    `${process.env.REACT_APP_SUPPORT_LINK}/kb/article/servico-nomes`,
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
                    `${process.env.REACT_APP_SUPPORT_LINK}/kb/article/itens-diferentes`,
                    "_blank"
                  )
                }
                size="large"
                block
                style={{ marginTop: "20px" }}
              >
                Indicador de itens diferentes
              </Button>

              <Button
                type="default"
                onClick={() =>
                  window.open(
                    `${process.env.REACT_APP_SUPPORT_LINK}/kb/article/escore-global`,
                    "_blank"
                  )
                }
                size="large"
                block
                style={{ marginTop: "20px" }}
              >
                O que é o Escore Global?
              </Button>

              <Button
                type="primary"
                onClick={() =>
                  window.open(
                    `${process.env.REACT_APP_SUPPORT_LINK}/kb`,
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
      </PageContainer>
    </>
  );
}

export default SupportCenter;
