import React from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import withLayout from "lib/withLayout";
import {
  ExportOutlined,
  MessageOutlined,
  BulbOutlined,
} from "@ant-design/icons";
import { Typography, Divider, Row, Col } from "antd";

import Button from "components/Button";
import { PageHeader } from "styles/PageHeader.style";
import { PageCard } from "styles/Utils.style";

function Help() {
  const { t } = useTranslation();
  const user = useSelector((state) => state.user);

  const openTickets = () => {
    window.open(`${process.env.REACT_APP_SUPPORT_LINK}/helpcenter`, "_blank");
  };

  const openChat = () => {
    try {
      window.octadesk.chat.login({
        name: user.account.userName,
        email: user.account.email,
      });
      window.octadesk.chat.toggle();
    } catch (ex) {
      console.error("octadesk error", ex);
      window.open(`mailto:${process.env.REACT_APP_SUPPORT_EMAIL}`);
    }
  };

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">{t("menu.help")}</h1>
        </div>
      </PageHeader>
      <Row gutter={24}>
        <Col xs={12}>
          <PageCard>
            <Typography.Title level={4} style={{ marginTop: 0 }}>
              Chamados de Suporte
            </Typography.Title>
            <Typography.Paragraph>
              Para acompanhar o andamento dos seus chamados de suporte, acesse o
              link abaixo:
            </Typography.Paragraph>
            <Button
              type="default"
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
              4) Um email será enviado com a senha para acessar os seus chamados
              de suporte.
            </Typography.Paragraph>
          </PageCard>
        </Col>
        <Col xs={6}>
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
              Base de Conhecimento
            </Typography.Title>
            <Typography.Paragraph></Typography.Paragraph>
            <Button
              type="default"
              onClick={() =>
                window.open(
                  `${process.env.REACT_APP_SUPPORT_LINK}/kb`,
                  "_blank"
                )
              }
              icon={<BulbOutlined />}
              size="large"
              block
              style={{ marginTop: "20px" }}
            >
              Acessar a Base de Conhecimento
            </Button>
          </PageCard>
        </Col>
      </Row>
    </>
  );
}

export default withLayout(Help, {});
