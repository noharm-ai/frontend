import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTransition, animated, config } from "@react-spring/web";
import { UserOutlined, FileOutlined, NumberOutlined } from "@ant-design/icons";

import Tooltip from "components/Tooltip";
import { getAlerts } from "components/Screening/AlertCard";
import { Card, AlertContainer } from "./index.style";

const TabContent = ({ tab }) => {
  const { t } = useTranslation();

  if (tab === "patient") {
    const stats = {
      allergy: 0,
      dup: 1,
      elderly: 0,
      exams: 0,
      inc: 0,
      int: 1,
      kidney: 0,
      liver: 0,
      maxDose: 1,
      maxTime: 0,
      platelets: 0,
      rea: 0,
      tube: 0,
    };
    const alerts = getAlerts(stats, t);

    return (
      <div className="attributes">
        <div className="attributes-item">
          <div className="attributes-item-label">{t("patientCard.age")}</div>
          <div className="attributes-item-value">10</div>
        </div>
        <div className="attributes-item">
          <div className="attributes-item-label">{t("patientCard.age")}</div>
          <div className="attributes-item-value">10</div>
        </div>
        <div className="attributes-item">
          <div className="attributes-item-label">{t("patientCard.age")}</div>
          <div className="attributes-item-value">10</div>
        </div>
        <div className="attributes-item">
          <div className="attributes-item-label">{t("patientCard.age")}</div>
          <div className="attributes-item-value">10</div>
        </div>
        <div className="attributes-item">
          <div className="attributes-item-label">{t("patientCard.age")}</div>
          <div className="attributes-item-value">10</div>
        </div>
        <div className="attributes-item">
          <div className="attributes-item-label">{t("patientCard.age")}</div>
          <div className="attributes-item-value">10</div>
        </div>
        <div className="attributes-item full">
          <div className="attributes-item-label">Alertas</div>
          <div className="attributes-item-value">
            <AlertContainer>
              {alerts
                .filter((a) => a.value > 0)
                .map((a) => (
                  <Tooltip title={a.label} key={a.label}>
                    <div className="alert">
                      {a.icon()} {a.value}
                    </div>
                  </Tooltip>
                ))}
            </AlertContainer>
          </div>
        </div>
      </div>
    );
  }

  if (tab === "admission") {
    return (
      <div className="attributes">
        <div className="attributes-item">
          <div className="attributes-item-label">
            {t("patientCard.admission")}
          </div>
          <div className="attributes-item-value">10</div>
        </div>
        <div className="attributes-item">
          <div className="attributes-item-label">
            {t("patientCard.admission")}
          </div>
          <div className="attributes-item-value">10</div>
        </div>
        <div className="attributes-item">
          <div className="attributes-item-label">
            {t("patientCard.admission")}
          </div>
          <div className="attributes-item-value">10</div>
        </div>
        <div className="attributes-item">
          <div className="attributes-item-label">
            {t("patientCard.admission")}
          </div>
          <div className="attributes-item-value">10</div>
        </div>
        <div className="attributes-item">
          <div className="attributes-item-label">
            {t("patientCard.admission")}
          </div>
          <div className="attributes-item-value">10</div>
        </div>
        <div className="attributes-item">
          <div className="attributes-item-label">
            {t("patientCard.admission")}
          </div>
          <div className="attributes-item-value">10</div>
        </div>
        <div className="attributes-item full">
          <div className="attributes-item-label">
            {t("patientCard.admission")}
          </div>
          <div className="attributes-item-value">10</div>
        </div>
      </div>
    );
  }

  if (tab === "numbers") {
    return (
      <div className="attributes col-3">
        <div className="attributes-item">
          <div className="attributes-item-label">
            {t("patientCard.admission")}
          </div>
          <div className="attributes-item-value">10</div>
        </div>
        <div className="attributes-item">
          <div className="attributes-item-label">
            {t("patientCard.admission")}
          </div>
          <div className="attributes-item-value">10</div>
        </div>
        <div className="attributes-item">
          <div className="attributes-item-label">
            {t("patientCard.admission")}
          </div>
          <div className="attributes-item-value">10</div>
        </div>
        <div className="attributes-item">
          <div className="attributes-item-label">
            {t("patientCard.admission")}
          </div>
          <div className="attributes-item-value">10</div>
        </div>
        <div className="attributes-item">
          <div className="attributes-item-label">
            {t("patientCard.admission")}
          </div>
          <div className="attributes-item-value">10</div>
        </div>
        <div className="attributes-item">
          <div className="attributes-item-label">
            {t("patientCard.admission")}
          </div>
          <div className="attributes-item-value">10</div>
        </div>
        <div className="attributes-item">
          <div className="attributes-item-label">
            {t("patientCard.admission")}
          </div>
          <div className="attributes-item-value">10</div>
        </div>
        <div className="attributes-item">
          <div className="attributes-item-label">
            {t("patientCard.admission")}
          </div>
          <div className="attributes-item-value">10</div>
        </div>
        <div className="attributes-item">
          <div className="attributes-item-label">
            {t("patientCard.admission")}
          </div>
          <div className="attributes-item-value">10</div>
        </div>
        <div className="attributes-item">
          <div className="attributes-item-label">
            {t("patientCard.admission")}
          </div>
          <div className="attributes-item-value">10</div>
        </div>
        <div className="attributes-item">
          <div className="attributes-item-label">
            {t("patientCard.admission")}
          </div>
          <div className="attributes-item-value">10</div>
        </div>
        <div className="attributes-item">
          <div className="attributes-item-label">
            {t("patientCard.admission")}
          </div>
          <div className="attributes-item-value">10</div>
        </div>
      </div>
    );
  }

  return null;
};

export default function PrioritizationCard({ prescription }) {
  const [activeTab, setActiveTab] = useState("patient");

  const transitions = useTransition(activeTab, {
    from: {
      opacity: 0,
      transform: "translate3d(5px, 0, 0)",
    },
    enter: { opacity: 1, transform: "translate3d(0, 0, 0)" },
    delay: 150,
    config: config.slow,
  });

  return (
    <Card alert={prescription.class}>
      <div className="card-header">
        <div className="name">{prescription.namePatient}</div>
        <div className="stamp">
          <div className="stamp-label">Escore Global</div>
          <div className="stamp-value">100</div>
        </div>
      </div>

      {transitions((styles) => (
        <animated.div style={styles}>
          <TabContent tab={activeTab} />
        </animated.div>
      ))}

      <div className="tabs">
        <div
          className={`tab ${activeTab === "patient" ? "active" : ""}`}
          onClick={() => setActiveTab("patient")}
        >
          <UserOutlined />
        </div>
        <div
          className={`tab ${activeTab === "admission" ? "active" : ""}`}
          onClick={() => setActiveTab("admission")}
        >
          <FileOutlined />
        </div>
        <div
          className={`tab ${activeTab === "numbers" ? "active" : ""}`}
          onClick={() => setActiveTab("numbers")}
        >
          <NumberOutlined />
        </div>
      </div>
    </Card>
  );
}
