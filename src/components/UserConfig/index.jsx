import React from "react";
import { useSelector } from "react-redux";
import axios from "axios";

import Tabs from "components/Tabs";
import Button from "components/Button";
import notification from "components/notification";

import Signature from "containers/UserConfig/Signature";
import ChangePassword from "containers/UserConfig/ChangePassword";

export default function UserConfig({ cleanCache }) {
  const endpointConfig = useSelector((state) => state.app.config);

  const executeCleanCache = async () => {
    cleanCache();

    const urlRequest = endpointConfig.nameUrl.replace("{idPatient}", "clear");

    try {
      await axios.get(urlRequest, {
        timeout: 8000,
        headers: endpointConfig.nameHeaders,
      });
    } catch (error) {
      console.error(error);
    }

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
