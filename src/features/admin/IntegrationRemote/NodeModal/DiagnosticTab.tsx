import { Descriptions } from "antd";

import { INodeData } from "./NodeModal";

export function DiagnosticTab({ data }: { data: INodeData }) {
  return (
    <Descriptions bordered size="small">
      {data?.status &&
        Object.keys(data.status).map((k) => (
          <Descriptions.Item label={k} span={3} key={k}>
            {data.status[k] instanceof Object ? "" : data.status[k]}
          </Descriptions.Item>
        ))}
    </Descriptions>
  );
}
