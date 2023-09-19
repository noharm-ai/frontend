import React from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  GiftOutlined,
  ReadOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

import Alert from "components/Alert";
import Tooltip from "components/Tooltip";
import toast from "components/notification";
import { getErrorMessage } from "utils/errorHandler";
import { INFO_ALERT_MEMORY_TYPE } from "utils/memory";
import { putMemory } from "features/serverActions/ServerActionsSlice";

import { MessageLink } from "../Layout.style";

export default function InfoAlert({ userId, notification, setNotification }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const onClose = () => {
    dispatch(
      putMemory({
        type: `${INFO_ALERT_MEMORY_TYPE}-${notification.id}-${userId}`,
        value: true,
      })
    ).then((response) => {
      if (response.error) {
        toast.error({
          message: getErrorMessage(response, t),
        });
      } else {
        setNotification(null);
      }
    });
  };

  const getIcon = () => {
    const style = { fontSize: "18px", marginRight: "5px" };
    switch (notification.icon) {
      case "gift":
        return <GiftOutlined style={style} />;

      case "read":
        return <ReadOutlined style={style} />;

      default:
        return <InfoCircleOutlined style={style} />;
    }
  };

  if (!notification) {
    return null;
  }

  const message = (
    <Tooltip title={notification.tooltip}>
      <MessageLink
        href={notification.link}
        className={notification.classname}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => onClose()}
      >
        {getIcon()} {notification.title}
      </MessageLink>
    </Tooltip>
  );

  return (
    <div style={{ marginLeft: "10px" }}>
      <Alert message={message} type="info" closable onClose={onClose} />
    </div>
  );
}
