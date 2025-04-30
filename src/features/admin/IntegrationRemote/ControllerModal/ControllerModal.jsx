import React, { useState } from "react";
import { Tabs } from "antd";

import DefaultModal from "components/Modal";
import Heading from "components/Heading";
import Descriptions from "components/Descriptions";
import Button from "components/Button";
import { ControllerActionModal } from "./ControllerActionModal";

export default function ControllerModal({ data, onCancel }) {
  const [wizardModal, setWizardModal] = useState(false);

  const footerActions = () => {
    return [
      <Button type="primary" onClick={() => setWizardModal(true)}>
        Alterar status
      </Button>,
    ];
  };

  const items = [
    {
      key: "1",
      label: "Geral",
      children: (
        <Descriptions bordered size="small">
          {data &&
            Object.keys(data).map((k) => (
              <React.Fragment key={k}>
                {k !== "properties" && k !== "propertyDescriptors" && (
                  <Descriptions.Item label={k} span={3}>
                    {data[k] instanceof Object
                      ? JSON.stringify(data[k])
                      : data[k]}
                  </Descriptions.Item>
                )}
              </React.Fragment>
            ))}
        </Descriptions>
      ),
    },
    {
      key: "2",
      label: "Propriedades",
      children: (
        <Descriptions bordered size="small">
          {data?.properties &&
            Object.keys(data?.properties).map((k) => (
              <Descriptions.Item label={k} span={3} key={k}>
                {data?.properties[k] instanceof Object
                  ? ""
                  : typeof data?.properties[k] === "object"
                  ? JSON.stringify(data?.properties[k])
                  : data?.properties[k]}
              </Descriptions.Item>
            ))}
        </Descriptions>
      ),
    },
  ];

  return (
    <DefaultModal
      width={"60vw"}
      centered
      destroyOnClose
      open={data}
      onCancel={onCancel}
      footer={footerActions()}
    >
      <Heading $margin="0 0 11px" $size="18px">
        {data?.name}
      </Heading>

      <Tabs defaultActiveKey="1" items={items} />
      <ControllerActionModal
        open={wizardModal}
        onCancel={() => setWizardModal(false)}
        data={data}
      />
    </DefaultModal>
  );
}
