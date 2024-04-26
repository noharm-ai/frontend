import React, { useState } from "react";
import { List, Skeleton } from "antd";
import { SettingOutlined, SearchOutlined } from "@ant-design/icons";

import Button from "components/Button";
import ControllerModal from "./ControllerModal";

export default function ControllersList({ template, templateStatus, loading }) {
  const [selectedController, setSelectedController] = useState(null);

  return (
    <>
      <List
        className="demo-loadmore-list"
        loading={loading}
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
            <Skeleton avatar title={false} loading={loading} active>
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
