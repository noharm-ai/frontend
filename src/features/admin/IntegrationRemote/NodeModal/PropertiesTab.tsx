import React from "react";
import { Descriptions } from "antd";

import { INodeData } from "./NodeModal";

export function PropertiesTab({ data }: { data: INodeData }) {
  return (
    <Descriptions bordered size="small">
      {data?.extra &&
        Object.keys(data.extra).map((k) => (
          <React.Fragment key={k}>
            {k !== "properties" && k !== "propertyDescriptors" && (
              <Descriptions.Item label={k} span={3}>
                {data.extra[k] instanceof Object
                  ? JSON.stringify(data.extra[k])
                  : data.extra[k]}
              </Descriptions.Item>
            )}
          </React.Fragment>
        ))}
      {data?.extra?.properties &&
        Object.keys(data.extra?.properties).map((k) => (
          <Descriptions.Item label={k} span={3} key={k}>
            {data.extra[k]?.properties instanceof Object
              ? ""
              : typeof data.extra?.properties[k] === "object"
              ? JSON.stringify(data.extra?.properties[k])
              : data.extra?.properties[k]}
          </Descriptions.Item>
        ))}
    </Descriptions>
  );
}
