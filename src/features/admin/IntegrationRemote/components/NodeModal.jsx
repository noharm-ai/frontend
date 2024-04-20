import React from "react";
import { Tabs } from "antd";

import DefaultModal from "components/Modal";
import Heading from "components/Heading";
import Descriptions from "components/Descriptions";

export default function NodeModal({ data, onCancel }) {
  const items = [
    {
      key: "1",
      label: "Geral",
      children: (
        <Descriptions bordered size="small">
          {data?.extra &&
            Object.keys(data.extra).map((k) => (
              <>
                {k !== "properties" && k !== "propertyDescriptors" && (
                  <Descriptions.Item label={k} span={3}>
                    {data.extra[k] instanceof Object
                      ? JSON.stringify(data.extra[k])
                      : data.extra[k]}
                  </Descriptions.Item>
                )}
              </>
            ))}
        </Descriptions>
      ),
    },
    {
      key: "2",
      label: "Propriedades",
      children: (
        <Descriptions bordered size="small">
          {data?.extra?.properties &&
            Object.keys(data.extra?.properties).map((k) => (
              <Descriptions.Item label={k} span={3}>
                {data.extra[k]?.properties instanceof Object
                  ? ""
                  : typeof data.extra?.properties[k] === "object"
                  ? JSON.stringify(data.extra?.properties[k])
                  : data.extra?.properties[k]}
              </Descriptions.Item>
            ))}
        </Descriptions>
      ),
    },
    {
      key: "3",
      label: "Diagnóstico",
      children: (
        <Descriptions bordered size="small">
          {data?.status &&
            Object.keys(data.status).map((k) => (
              <Descriptions.Item label={k} span={3}>
                {data.status[k] instanceof Object ? "" : data.status[k]}
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
    >
      <Heading margin="0 0 11px" size="18px">
        {data?.name}
      </Heading>

      <Tabs defaultActiveKey="1" items={items} />
    </DefaultModal>
  );
}
