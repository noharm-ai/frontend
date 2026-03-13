import React from "react";
import { useSelector } from "react-redux";
import axios from "axios";

import Tabs from "components/Tabs";
import Button from "components/Button";
import notification from "components/notification";

import Signature from "containers/UserConfig/Signature";
import ChangePassword from "containers/UserConfig/ChangePassword";
import TourTooltip from "components/TourTooltip";
import tourConfig from "./tourConfig.json";

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
      label: (
        <TourTooltip {...tourConfig.signatureTab}>
          <span>Textos padrão</span>
        </TourTooltip>
      ),
      children: <Signature />,
    },
    {
      key: "2",
      label: (
        <TourTooltip {...tourConfig.securityTab}>
          <span>Segurança</span>
        </TourTooltip>
      ),
      children: <ChangePassword />,
    },
    {
      key: "3",
      label: (
        <TourTooltip {...tourConfig.cacheTab}>
          <span>Cache</span>
        </TourTooltip>
      ),
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
