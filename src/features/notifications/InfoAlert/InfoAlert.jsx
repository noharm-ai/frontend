import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { BellOutlined, CheckOutlined } from "@ant-design/icons";
import { Badge } from "antd";

import Button from "components/Button";
import Modal from "components/Modal";
import Tooltip from "components/Tooltip";
import RichTextView from "components/RichTextView";
import toast from "components/notification";
import { getErrorMessage } from "utils/errorHandler";
import { formatDate } from "utils/date";
import { INFO_ALERT_MEMORY_TYPE } from "utils/memory";
import { putMemory } from "features/serverActions/ServerActionsSlice";
import { removeNotification } from "features/notifications/NotificationsSlice";

import { NotificationCard, NotificationTrigger } from "./InfoAlert.style";

export function InfoAlert() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const notifications = useSelector((state) => state.notifications.list);
  const userId = useSelector((state) => state.user.account.userId);
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingId, setLoadingId] = useState(null);

  if (!notifications || notifications.length === 0) {
    return null;
  }

  const onMarkAsRead = (notification) => {
    setLoadingId(notification.id);
    dispatch(
      putMemory({
        type: `${INFO_ALERT_MEMORY_TYPE}-${notification.id}-${userId}`,
        value: true,
      }),
    ).then((response) => {
      setLoadingId(null);
      if (response.error) {
        toast.error({ message: getErrorMessage(response, t) });
      } else {
        dispatch(removeNotification(notification.id));
      }
    });
  };

  return (
    <>
      <Tooltip title={t("layout.notifications")} placement="bottom">
        <NotificationTrigger onClick={() => setModalOpen(true)}>
          <Badge count={notifications.length} size="small">
            <BellOutlined style={{ fontSize: "24px", color: "#2e3c5a" }} />
          </Badge>
        </NotificationTrigger>
      </Tooltip>

      <Modal
        title={t("layout.notifications")}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={600}
      >
        {notifications.map((item) => (
          <NotificationCard key={item.id}>
            <div className="notification-header">
              {item.date && (
                <div className="notification-date">{formatDate(item.date)}</div>
              )}
              <div className="notification-title">{item.title}</div>
            </div>
            <div className="notification-body">
              <div className="notification-content">
                <RichTextView text={item.text} maxWidth="100%" />
              </div>
              <div className="notification-footer">
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckOutlined />}
                  loading={loadingId === item.id}
                  onClick={() => onMarkAsRead(item)}
                >
                  {t("layout.markAsRead")}
                </Button>
              </div>
            </div>
          </NotificationCard>
        ))}
      </Modal>
    </>
  );
}
