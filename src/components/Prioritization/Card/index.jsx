import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTransition, animated, config } from "@react-spring/web";
import { UserOutlined, FileOutlined } from "@ant-design/icons";

import { Card } from "./index.style";

const TabContent = ({ tab }) => {
  const { t } = useTranslation();

  if (tab === "patient") {
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
          <div className="attributes-item-label">{t("patientCard.age")}</div>
          <div className="attributes-item-value">10</div>
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
      <div className="name">{prescription.namePatient}</div>

      {transitions((styles, item) => (
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
      </div>
    </Card>
  );
}
