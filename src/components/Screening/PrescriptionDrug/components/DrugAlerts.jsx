import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Alert, Tag } from "antd";
import {
  PlusOutlined,
  MinusOutlined,
  CloseCircleFilled,
} from "@ant-design/icons";

import Button from "components/Button";
import Tooltip from "components/Tooltip";
import DefaultModal from "components/Modal";
import notification from "components/notification";
import RichTextView from "components/RichTextView";
import { getErrorMessage } from "utils/errorHandler";
import { getSubstanceHandling } from "features/serverActions/ServerActionsSlice";
import {
  trackPrescriptionAction,
  TrackedPrescriptionAction,
} from "src/utils/tracker";

import { DrugAlertsCollapse } from "../PrescriptionDrug.style";

export default function DrugAlerts({ alerts, idSubstance }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [activeKey, setActiveKey] = useState(["high", "medium", "low"]);
  const [loading, setLoading] = useState(false);

  if (alerts == null || alerts.length === 0) {
    return null;
  }

  const getHandling = (alertType) => {
    trackPrescriptionAction(TrackedPrescriptionAction.CLICK_ALERT_HANDLING);

    setLoading(true);
    dispatch(getSubstanceHandling({ sctid: idSubstance, alertType })).then(
      (response) => {
        setLoading(false);

        if (response.error) {
          notification.error({
            message: getErrorMessage(response, t),
          });
        } else {
          if (response.payload.data) {
            DefaultModal.info({
              title: "Manejo",
              content: (
                <RichTextView
                  text={response?.payload?.data || "Texto não encontrado"}
                />
              ),
              icon: null,
              width: 550,
              okText: "Fechar",
              okButtonProps: { type: "default" },
              wrapClassName: "default-modal",
              mask: { blur: false },
            });
          }
        }
      }
    );
  };

  const activeKeyChange = (keys) => {
    setActiveKey(keys);
  };

  const toggleAll = (groups) => {
    if (activeKey.length) {
      setActiveKey([]);
    } else {
      setActiveKey(Object.keys(groups));
    }
  };

  const drugAlertTitle = (type, group) => {
    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        <>
          <Tag className={`tag ${type}`} style={{ marginRight: "8px" }}>
            {group.length}
          </Tag>
          {t(`drugAlertType.${type}`)}
        </>
      </div>
    );
  };

  const getIconColor = (type) => {
    switch (type) {
      case "high":
        return "#f44336";
      case "medium":
        return "#f57f17";
      case "low":
        return "#ffc107";
      default:
        return "#f44336";
    }
  };

  const groups = {};
  alerts.forEach((a) => {
    const type = a.level;

    if (!Object.prototype.hasOwnProperty.call(groups, type)) {
      groups[type] = [a];
    } else {
      groups[type].push(a);
    }
  });

  const items = [];

  ["high", "medium", "low"].forEach((type) => {
    if (groups[type]) {
      items.push({
        key: type,
        label: drugAlertTitle(type, groups[type]),
        className: type,
        children: (
          <>
            {groups[type].map((item, index) => (
              <Alert
                key={index}
                type="error"
                message={<RichTextView text={item.text} />}
                style={{ marginTop: "5px", background: "#fff" }}
                showIcon
                icon={
                  <CloseCircleFilled style={{ color: getIconColor(type) }} />
                }
                action={
                  item.handling ? (
                    <Button
                      size="small"
                      danger
                      onClick={() => getHandling(item.type)}
                      loading={loading}
                    >
                      Ver manejo
                    </Button>
                  ) : null
                }
              />
            ))}
          </>
        ),
      });
    }
  });

  return (
    <div style={{ display: "flex" }}>
      <Tooltip
        title={activeKey.length ? "Recolher alertas" : "Expandir todos alertas"}
      >
        <Button
          onClick={() => toggleAll(groups)}
          icon={activeKey.length ? <MinusOutlined /> : <PlusOutlined />}
          danger
          size="small"
          style={{
            width: "25px",
            marginRight: "15px",
            marginTop: "7px",
            border: "1px solid #ffccc7",
          }}
        />
      </Tooltip>
      <div style={{ flex: "1" }}>
        <DrugAlertsCollapse
          expandIconPosition="start"
          items={items}
          size="small"
          activeKey={activeKey}
          onChange={activeKeyChange}
        />
      </div>
    </div>
  );
}
