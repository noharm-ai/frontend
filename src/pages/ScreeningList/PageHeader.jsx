import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import Heading from "components/Heading";
import { Row, Col } from "components/Grid";
import Alert from "components/Alert";
import Button from "components/Button";
import InitialPage from "features/preferences/InitialPage/InitialPage";
import { getStorageItem, setStorageItem } from "utils/storage";

export default function PageHeader({ prioritizationType }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const title = `screeningList.title-${prioritizationType}`;

  const closeInfo = () => {
    setStorageItem("card-alert", true);
  };

  const goToCards = () => {
    setStorageItem("card-alert", true);
    navigate("/priorizacao/pacientes/cards");
  };

  return (
    <div style={{ marginBottom: "30px" }}>
      <Row type="flex" style={{ marginBottom: "15px" }} align="middle">
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
            {!getStorageItem("card-alert") && (
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
          <InitialPage />
        </Col>
      </Row>
    </div>
  );
}
