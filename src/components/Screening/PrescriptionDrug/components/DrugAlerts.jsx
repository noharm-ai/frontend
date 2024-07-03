import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Tag } from "antd";
import {
  PlusOutlined,
  MinusOutlined,
  CloseCircleFilled,
} from "@ant-design/icons";

import RichTextView from "components/RichTextView";
import Button from "components/Button";
import Tooltip from "components/Tooltip";
import { DrugAlertsCollapse } from "../PrescriptionDrug.style";

export default function DrugAlerts({ alerts, disableGroups }) {
  const { t } = useTranslation();
  const [activeKey, setActiveKey] = useState(["high"]);
  if (alerts == null || alerts.length === 0) {
    return null;
  }

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
          <Tag className={`tag ${type}`}>{group.length}</Tag>
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
    let type = a.level;

    if (!groups.hasOwnProperty(type)) {
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
              />
            ))}
          </>
        ),
      });
    }
  });

  if (disableGroups) {
    return (
      <>
        {alerts.map((item, index) => (
          <Alert
            key={index}
            type="error"
            message={<RichTextView text={item.text} />}
            style={{ marginTop: "5px" }}
            showIcon
          />
        ))}
      </>
    );
  }

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
          defaultActiveKey="high"
          items={items}
          size="small"
          activeKey={activeKey}
          onChange={activeKeyChange}
        />
      </div>
    </div>
  );
}
