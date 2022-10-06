import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Tooltip } from "antd";
import { useNavigate } from "react-router-dom";

import Heading from "components/Heading";
import { Row, Col } from "components/Grid";
import Switch from "components/Switch";
import Alert from "components/Alert";
import Button from "components/Button";

const getPrioritizationName = (type) => {
  switch (type) {
    case "prescription":
      return "prescrição";
    case "patient":
      return "patient";
    case "conciliation":
      return "conciliação";
    default:
      console.error("invalid prioritization type:", type);
  }
};

export default function PageHeader({
  journey,
  prioritizationType,
  setJourney,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stateChecked, setStateChecked] = useState(false);
  const title = `screeningList.title-${prioritizationType}`;

  const name = getPrioritizationName(prioritizationType);
  const msg =
    journey === prioritizationType
      ? "Priorização padrão"
      : `Definir a priorização por ${name} como tela inicial`;

  const onChangeJourney = (checked) => {
    if (checked) {
      setJourney(prioritizationType);
      setStateChecked(true);
    }
  };

  const closeInfo = () => {
    localStorage.setItem("card-alert", true);
  };

  const goToCards = () => {
    localStorage.setItem("card-alert", true);
    navigate("/priorizacao/pacientes/cards");
  };

  return (
    <div style={{ marginBottom: "30px" }}>
      <Row type="flex" css="margin-bottom: 15px;" align="middle">
        <Col span={24} md={10}>
          <header>
            <Heading>{t(title)}</Heading>
          </header>
        </Col>
        <Col
          span={24}
          md={24 - 10}
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <div style={{ maxWidth: "500px" }}>
            {!localStorage.getItem("card-alert") && (
              <Alert
                showIcon
                message="Nova interface de priorização"
                description="Já conhece a nova interface de priorização por pacientes?"
                type="info"
                closable
                action={
                  <Button size="small" onClick={() => goToCards()}>
                    Experimentar
                  </Button>
                }
                onClose={closeInfo}
              />
            )}
          </div>
          {(journey !== prioritizationType || stateChecked) && (
            <Tooltip title={msg}>
              <Switch
                unCheckedChildren="Padrão"
                onChange={onChangeJourney}
                checked={journey === prioritizationType}
                disabled={journey === prioritizationType}
                id="gtm-default-initial"
                style={{ marginLeft: "15px" }}
              />
            </Tooltip>
          )}
        </Col>
      </Row>
    </div>
  );
}
