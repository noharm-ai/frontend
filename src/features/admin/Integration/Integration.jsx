import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Card, Col, Row, Avatar } from "antd";
import { RetweetOutlined, ThunderboltOutlined } from "@ant-design/icons";

import notification from "components/notification";
import Tooltip from "components/Tooltip";
import Button from "components/Button";
import DefaultModal from "components/Modal";
import { getErrorMessage } from "utils/errorHandler";

import { refreshAgg, refreshPrescription, reset } from "./IntegrationSlice";
import { PageHeader } from "styles/PageHeader.style";
import { IntegrationContainer } from "./Integration.style";

function IntegrationAdmin() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const refreshAggStatus = useSelector(
    (state) => state.admin.integration.refreshAgg.status
  );
  const refreshPrescriptionStatus = useSelector(
    (state) => state.admin.integration.refreshPrescription.status
  );

  useEffect(() => {
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  const dispatchAction = (action) => {
    dispatch(action()).then((response) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        notification.success({
          message: "Finalizado com sucesso!",
        });
      }
    });
  };

  const confirmAction = (action, msg) => () => {
    DefaultModal.confirm({
      title: "Confirma a ação?",
      content: (
        <>
          <p>{msg}</p>
        </>
      ),
      onOk: () => dispatchAction(action),
      okText: "Confirmar",
      cancelText: "Cancelar",
      width: 500,
    });
  };

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">Integração</h1>
          <div className="page-header-legend">Utilizades para a integração</div>
        </div>
      </PageHeader>
      <IntegrationContainer>
        <Row gutter={16}>
          <Col xs={{ span: 24 }} lg={{ span: 8 }} xxl={{ span: 6 }}>
            <Card
              actions={[
                <Tooltip title="Executar">
                  <Button
                    shape="circle"
                    icon={<ThunderboltOutlined />}
                    size="large"
                    loading={refreshAggStatus === "loading"}
                    onClick={() =>
                      confirmAction(refreshAgg, "Recalcular prescricaoagg")()
                    }
                  ></Button>
                </Tooltip>,
              ]}
            >
              <Card.Meta
                avatar={
                  <Avatar
                    icon={<RetweetOutlined />}
                    style={{ backgroundColor: "#a991d6", color: "#fff" }}
                  />
                }
                title="Recalcular prescricaoagg"
                description="Atualiza as informações de segmento, dose convertida e frequência dia. Útil quando houver alterações nos setores dos segmentos, novas conversões de unidades ou mudanças na configuração de frequências."
              />
            </Card>
          </Col>
          <Col xs={{ span: 24 }} lg={{ span: 8 }} xxl={{ span: 6 }}>
            <Card
              actions={[
                <Tooltip title="Executar">
                  <Button
                    shape="circle"
                    icon={<ThunderboltOutlined />}
                    size="large"
                    loading={refreshPrescriptionStatus === "loading"}
                    onClick={() =>
                      confirmAction(
                        refreshPrescription,
                        "Recalcular prescricao e presmed. Atenção: essa ação deve ser executada somente durante o processo de integração."
                      )()
                    }
                  ></Button>
                </Tooltip>,
              ]}
            >
              <Card.Meta
                avatar={
                  <Avatar
                    icon={<RetweetOutlined />}
                    style={{ backgroundColor: "#a991d6", color: "#fff" }}
                  />
                }
                title="Recalcular prescricao e presmed"
                description="Utilizar somente durante o processo de integração. Atualiza as informações de segmento, dose convertida e frequência dia. Útil quando houver alterações nos setores dos segmentos, novas conversões de unidades ou mudanças na configuração de frequências."
              />
            </Card>
          </Col>
          <Col xs={{ span: 24 }} lg={{ span: 8 }} xxl={{ span: 6 }}></Col>
        </Row>
      </IntegrationContainer>
    </>
  );
}

export default IntegrationAdmin;
