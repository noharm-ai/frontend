import React from "react";
import { useTranslation } from "react-i18next";
import {
  LinkOutlined,
  CheckOutlined,
  WarningOutlined,
  RollbackOutlined,
  MoreOutlined,
} from "@ant-design/icons";

import Badge from "components/Badge";
import Menu from "components/Menu";
import Dropdown from "components/Dropdown";
import Tooltip from "components/Tooltip";
import Button from "components/Button";
import Tag from "components/Tag";
import { sourceToStoreType } from "utils/transformers/prescriptions";

const PanelAction = ({
  id,
  header,
  source,
  groupData,
  checkScreening,
  isChecking,
}) => {
  const { t } = useTranslation();

  const summarySourceToType = (s) => {
    switch (sourceToStoreType(s)) {
      case "prescription":
        return "drugs";

      case "solution":
        return "solutions";
      case "procedure":
        return "procedures";

      case "diet":
        return "diet";

      default:
        console.error("invalid source", s);
        return null;
    }
  };

  const infoIcon = (title) => {
    return (
      <Tooltip title={title}>
        <CheckOutlined
          style={{
            fontSize: 18,
            color: "#52c41a",
            position: "absolute",
            top: "50%",
            transform: "translateY(-50%)",
            right: groupData ? "15px" : "60px",
          }}
        />
      </Tooltip>
    );
  };

  const summaryTags = (summary) => {
    const tags = [];

    if (summary.alerts) {
      tags.push(
        <Tooltip
          title={
            summary.alergy
              ? t("prescriptionDrugTags.alertsAllergy")
              : t("prescriptionDrugTags.alerts")
          }
          key="alerts"
        >
          <Badge dot count={summary.alergy}>
            <Tag color="red" key="alerts" className="tag-badge">
              {summary.alerts}
            </Tag>
          </Badge>
        </Tooltip>
      );
    }

    if (summary.interventions) {
      tags.push(
        <Tooltip
          title={t("prescriptionDrugTags.intervention")}
          key="interventions"
        >
          <WarningOutlined
            style={{
              fontSize: 18,
              color: "#fa8c16",
              verticalAlign: "middle",
              marginRight: "7px",
            }}
          />
        </Tooltip>
      );
    }

    if (!tags.length) {
      return null;
    }

    return tags.map((t) => t);
  };

  const handleMenuClick = ({ key, domEvent }) => {
    console.log("key", key);
    switch (key) {
      case "check":
        checkScreening(id, "s");
        break;

      case "undo":
        checkScreening(id, "0");
        break;

      default:
        console.error("event not defined");
    }

    domEvent.stopPropagation();
  };

  const prescriptionOptions = (header) => {
    return (
      <Menu onClick={handleMenuClick}>
        <Menu.Item className="gtm-btn-more-open" key="more">
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`/prescricao/${id}`}
            style={{ textDecoration: "none" }}
          >
            <LinkOutlined style={{ marginRight: "5px" }} />{" "}
            {t("labels.openPrescription")}
          </a>
        </Menu.Item>
        <Menu.Divider />
        {header.status !== "s" && (
          <Menu.Item key="check" className="gtm-btn-more-check">
            <CheckOutlined style={{ marginRight: "5px" }} />
            {t("labels.checkPrescription")}
          </Menu.Item>
        )}
        {header.status === "s" && (
          <Menu.Item key="undo" className="gtm-btn-more-undo">
            <RollbackOutlined style={{ marginRight: "5px" }} />
            {t("labels.undoCheckPrescription")}
          </Menu.Item>
        )}
      </Menu>
    );
  };

  const openMenu = (e) => {
    e.stopPropagation();
  };

  if (groupData) {
    if (groupData.checked) {
      return infoIcon("Todas as prescrições desta vigência já foram checadas");
    }

    return summaryTags(groupData.summary);
  }

  return (
    <>
      <div className="info">
        {header.status !== "s" &&
          summaryTags(header[summarySourceToType(source)] || {})}
        {header.status === "s" &&
          infoIcon(`${t("labels.checkedBy")}: ${header.user}`)}
      </div>

      <div>
        <Dropdown overlay={prescriptionOptions(header)} trigger={["click"]}>
          <Tooltip title="Opções">
            <Button
              type="link gtm-bt-check-single"
              onClick={openMenu}
              style={{ padding: 0 }}
              loading={isChecking}
            >
              {!isChecking && (
                <MoreOutlined style={{ marginLeft: 0, fontSize: "30px" }} />
              )}
            </Button>
          </Tooltip>
        </Dropdown>
      </div>
    </>
  );
};

export default PanelAction;
