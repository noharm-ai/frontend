import React from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import withLayout from "lib/withLayout";
import { ExportOutlined, MessageOutlined } from "@ant-design/icons";
import { Typography, Divider, Row, Col } from "antd";

import Button from "components/Button";
import { PageHeader } from "styles/PageHeader.style";
import { PageCard, PageContainer } from "styles/Utils.style";

function Help() {
  const { t } = useTranslation();
  const user = useSelector((state) => state.user);

  const openTickets = () => {
    window.open(`${process.env.REACT_APP_SUPPORT_LINK}/helpcenter`, "_blank");
  };

  const openChat = () => {};

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">{t("menu.help")}</h1>
        </div>
      </PageHeader>
      <PageContainer>
        <Row gutter={24}>
          <Col xs={16}>
            <PageCard>
              <Typography.Title level={4} style={{ marginTop: 0 }}>
                Chamados de Suporte
              </Typography.Title>
              <Typography.Paragraph>
                Para acompanhar o andamento dos seus chamados de suporte, acesse
                o link abaixo:
              </Typography.Paragraph>
              <Button
                type="primary"
                onClick={openTickets}
                icon={<ExportOutlined />}
                size="large"
                style={{ marginTop: "10px" }}
                block
              >
                {process.env.REACT_APP_SUPPORT_LINK}/helpcenter
              </Button>
              <Typography.Paragraph style={{ marginTop: "20px" }}>
                Além do link acima, todas a interações com o suporte também são
                encaminhadas para o seu email.
              </Typography.Paragraph>
              <Divider />
              <Typography.Title level={5}>
                Instruções para o Primeiro Acesso:
              </Typography.Title>
              <Typography.Paragraph>
                1) Acesse o link acima;{" "}
              </Typography.Paragraph>
              <Typography.Paragraph>
                2) Clique em "Esqueci minha senha";{" "}
              </Typography.Paragraph>
              <Typography.Paragraph>
                3) Utilize o mesmo email de acesso do seu usuário da NoHarm (
                <strong>{user.account.email}</strong>);
              </Typography.Paragraph>
              <Typography.Paragraph>
                4) Um email será enviado com o link para você criar a sua senha;
              </Typography.Paragraph>
              <Typography.Paragraph>
                5) Utilize a senha que você criou para acessar a área de
                acompanhamento dos seus chamados de suporte.
              </Typography.Paragraph>
            </PageCard>
          </Col>
          <Col xs={8}>
            <PageCard>
              <Typography.Title level={4} style={{ marginTop: 0 }}>
                Entre em Contato pelo Chat
              </Typography.Title>
              <Button
                type="primary"
                onClick={openChat}
                icon={<MessageOutlined />}
                size="large"
                block
                style={{ marginTop: "20px" }}
              >
                Acessar o Chat
              </Button>
            </PageCard>

            <PageCard>
              <Typography.Title level={4} style={{ marginTop: 0 }}>
                Perguntas Frequentes
              </Typography.Title>
              <Typography.Paragraph></Typography.Paragraph>
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

export default withLayout(Help, {});
