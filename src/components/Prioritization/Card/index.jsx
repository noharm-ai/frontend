import React from "react";
import { useTranslation } from "react-i18next";
import { UserOutlined } from "@ant-design/icons";

import { Card } from "./index.style";

export default function PrioritizationCard({ prescription }) {
  const { t } = useTranslation();

  return (
    <Card alert={prescription.class}>
      <div className="name">{prescription.namePatient}</div>

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

      <div className="tabs">
        <div className="tab active">
          <UserOutlined />
        </div>
        <div className="tab">
          <UserOutlined />
        </div>
      </div>
    </Card>
  );
}
