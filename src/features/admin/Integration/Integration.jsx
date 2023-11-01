import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Card, Col, Row, Avatar } from "antd";
import { RetweetOutlined, ThunderboltOutlined } from "@ant-design/icons";

import notification from "components/notification";
import Tooltip from "components/Tooltip";
import Button from "components/Button";
import { getErrorMessage } from "utils/errorHandler";

import { refreshAgg, reset } from "./IntegrationSlice";
import { PageHeader } from "styles/PageHeader.style";
import { IntegrationContainer } from "./Integration.style";

function IntegrationAdmin() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const refreshAggStatus = useSelector(
    (state) => state.admin.integration.refreshAgg.status
  );

  useEffect(() => {
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  const executeRefreshAgg = () => {
    dispatch(refreshAgg()).then((response) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        notification.success({
          message: "Prescricaoagg recalculada!",
          description: `${response.payload.data.data} registros atualizados`,
        });
      }
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
          <Col span={8}>
            <Card
              actions={[
                <Tooltip title="Executar">
                  <Button
                    shape="circle"
                    icon={<ThunderboltOutlined />}
                    size="large"
                    loading={refreshAggStatus === "loading"}
                    onClick={() => executeRefreshAgg()}
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
          <Col span={8}>
            <Card
              actions={[
                <Tooltip title="Executar">
                  <Button
                    shape="circle"
                    icon={<ThunderboltOutlined />}
                    size="large"
                    loading
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
                description="Falta implementar."
              />
            </Card>
          </Col>
          <Col span={8}></Col>
        </Row>
      </IntegrationContainer>
    </>
  );
}

export default IntegrationAdmin;
