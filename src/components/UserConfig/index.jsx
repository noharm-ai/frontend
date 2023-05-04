import React from "react";

import Tabs from "components/Tabs";
import Button from "components/Button";
import notification from "components/notification";

import Signature from "containers/UserConfig/Signature";
import ChangePassword from "containers/UserConfig/ChangePassword";

export default function UserConfig({ cleanCache }) {
  const executeCleanCache = () => {
    cleanCache();
    notification.success({
      message: "Cache limpo com sucesso!",
    });
  };

  const items = [
    {
      key: "1",
      label: "Textos padrão",
      children: <Signature />,
    },
    {
      key: "2",
      label: "Segurança",
      children: <ChangePassword />,
    },
    {
      key: "3",
      label: "Cache",
      children: (
        <Button type="primary" onClick={executeCleanCache}>
          Limpar cache de nomes dos pacientes
        </Button>
      ),
    },
  ];

  return (
    <Tabs
      defaultActiveKey="1"
      style={{ width: "100%", marginTop: "20px" }}
      type="card gtm-tab-userconfig"
      items={items}
    ></Tabs>
  );
}
