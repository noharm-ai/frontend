import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { List } from "antd";
import { SettingOutlined, SearchOutlined } from "@ant-design/icons";

import { setControllersModal } from "../IntegrationRemoteSlice";
import Button from "components/Button";
import ControllerModal from "../ControllerModal/ControllerModal";
import DefaultModal from "components/Modal";

export default function ControllersListModal() {
  const dispatch = useDispatch();
  const controllers = useSelector(
    (state) => state.admin.integrationRemote.template.controllers
  );
  const open = useSelector(
    (state) => state.admin.integrationRemote.modal.controllers
  );
  const [selectedController, setSelectedController] = useState(null);

  return (
    <DefaultModal
      width={"500px"}
      centered
      destroyOnHidden
      open={open}
      onCancel={() => dispatch(setControllersModal(null))}
      footer={null}
    >
      <div className="modal-title">Controllers</div>
      <List
        loading={false}
        itemLayout="horizontal"
        dataSource={controllers}
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
            <List.Item.Meta
              avatar={<SettingOutlined />}
              title={item.name}
              description={item.type}
            />
          </List.Item>
        )}
      />
      <ControllerModal
        data={selectedController}
        onCancel={() => setSelectedController(null)}
      />
    </DefaultModal>
  );
}
