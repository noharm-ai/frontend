import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  CheckOutlined,
  LoadingOutlined,
  CloseOutlined,
  SearchOutlined,
  ExclamationOutlined,
  DownloadOutlined,
  TableOutlined,
} from "@ant-design/icons";
import { Skeleton, List, Avatar, Drawer, notification } from "antd";

import Button from "components/Button";
import { setQueueDrawer, getQueueStatus } from "../IntegrationRemoteSlice";
import { formatDateTime } from "utils/date";
import QueueModal from "./QueueModal";
import { getErrorMessage } from "utils/errorHandler";
import { actionTypeToDescription } from "../transformer";

export default function NifiQueue() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const queue = useSelector(
    (state) => state.admin.integrationRemote.queue.list
  );
  const drawer = useSelector(
    (state) => state.admin.integrationRemote.queue.drawer
  );
  const [queueModal, setQueueModal] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const idQueueList = [];
      queue.forEach((q) => {
        if (!q.responseCode) {
          idQueueList.push(q.id);
        }
      });

      if (idQueueList.length > 0) {
        dispatch(getQueueStatus({ idQueueList })).then((response) => {
          if (response.error) {
            notification.error({
              message: getErrorMessage(response, t),
            });
          }
        });
      }
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [queue]); //eslint-disable-line

  const QueueAvatar = ({ item }) => {
    let icon = null;
    let color = null;
    let title = actionTypeToDescription(item.extra?.type);

    if (!item.responseCode) {
      icon = <LoadingOutlined />;
      color = "rgba(0, 0, 0, 0.25)";
    } else if (item.responseCode === 200) {
      icon = <CheckOutlined />;
      color = "#7ebe9a";

      if (item?.response?.listingRequest?.flowFileSummaries) {
        icon = <TableOutlined />;
        title = "Visualizar fila";
      }

      if (item.url.indexOf("/content") !== -1) {
        icon = <DownloadOutlined />;
        title = "Download flowfile";
      }
    } else if (item.responseCode === 202) {
      icon = <ExclamationOutlined />;
      color = "#faad14";
    } else {
      icon = <CloseOutlined />;
      color = "#ff4d4f";
    }

    return (
      <List.Item.Meta
        avatar={<Avatar style={{ backgroundColor: color }} icon={icon} />}
        description={
          <>
            {formatDateTime(item.createdAt)}
            <br />
            {item.extra?.entity}
          </>
        }
        title={title}
      />
    );
  };

  return (
    <>
      <Drawer
        title="Fila de ações"
        onClose={() => dispatch(setQueueDrawer(false))}
        open={drawer}
        mask={false}
      >
        <List
          itemLayout="horizontal"
          dataSource={queue}
          loading={false}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button
                  icon={<SearchOutlined />}
                  shape="circle"
                  onClick={() => setQueueModal(item)}
                  disabled={!item.responseCode}
                ></Button>,
              ]}
            >
              <Skeleton avatar title={false} active loading={false}>
                <QueueAvatar item={item} />
              </Skeleton>
            </List.Item>
          )}
        />
      </Drawer>
      <QueueModal data={queueModal} onCancel={() => setQueueModal(null)} />
    </>
  );
}
