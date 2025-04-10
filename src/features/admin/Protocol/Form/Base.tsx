import { Divider, Tabs } from "antd";

import { formatDateTime } from "src/utils/date";
import { MainTab } from "./MainTab";
import { VariableTab } from "./VariableTab";
import { TriggerTab } from "./TriggerTab";

export function BaseForm({ formData }: { formData: any }) {
  const getTabs = () => [
    {
      key: "0",
      label: "Geral",
      children: <MainTab />,
    },
    {
      key: "1",
      label: "Variáveis",
      children: <VariableTab />,
    },
    {
      key: "2",
      label: "Gatilho",
      children: <TriggerTab />,
    },
  ];

  return (
    <>
      <Tabs defaultActiveKey="0" items={getTabs()} />
      {formData.createdAt && (
        <>
          <Divider style={{ marginBottom: "10px" }} />
          <span style={{ opacity: 0.7 }}>
            Criado em: {formatDateTime(formData.createdAt)}
          </span>
        </>
      )}
    </>
  );
}
