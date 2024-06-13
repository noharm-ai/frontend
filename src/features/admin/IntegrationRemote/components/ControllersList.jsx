import React, { useState } from "react";
import { useSelector } from "react-redux";
import { List, Skeleton } from "antd";
import { SettingOutlined, SearchOutlined } from "@ant-design/icons";

import Button from "components/Button";
import ControllerModal from "./ControllerModal";

export default function ControllersList() {
  const status = useSelector((state) => state.admin.integrationRemote.status);
  const template = useSelector(
    (state) => state.admin.integrationRemote.template.data
  );
  const [selectedController, setSelectedController] = useState(null);

  return (
    <>
      <List
        className="demo-loadmore-list"
        loading={status === "loading"}
        itemLayout="horizontal"
        dataSource={template?.flowContents.controllerServices}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button
                icon={<SearchOutlined />}
                shape="circle"
                size="large"
                type="primary"
                onClick={() => setSelectedController(item)}
              ></Button>,
            ]}
          >
            <Skeleton
              avatar
              title={false}
              loading={status === "loading"}
              active
            >
              <List.Item.Meta
                avatar={<SettingOutlined />}
                title={item.name}
                description={item.type}
              />
            </Skeleton>
          </List.Item>
        )}
      />
      <ControllerModal
        data={selectedController}
        onCancel={() => setSelectedController(null)}
      />
    </>
  );
}
