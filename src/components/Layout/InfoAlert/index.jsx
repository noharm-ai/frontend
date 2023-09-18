import React from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import Alert from "components/Alert";
import Icon from "components/Icon";
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
        {notification.title} <Icon type={notification.icon} />
      </MessageLink>
    </Tooltip>
  );

  return (
    <div style={{ marginLeft: "10px" }}>
      <Alert
        message={message}
        type="info"
        closable
        style={{ paddingRight: "50px" }}
        onClose={onClose}
      />
    </div>
  );
}
