import React, { useState } from "react";
import { ReloadOutlined } from "@ant-design/icons";

import Tooltip from "components/Tooltip";
import Button from "components/Button";
import hospital from "services/hospital";
import DefaultModal from "components/Modal";
import notification from "components/notification";
import { Textarea } from "components/Inputs";

export default function PatientName({
  idPatient,
  name,
  setName,
  app,
  access_token,
}) {
  const [loading, setLoading] = useState(false);
  const [currentName, setCurrentName] = useState(null);

  const modalOk = () => {
    document.querySelector("#gtm-lnk-ajuda").click();
  };

  const copyError = (error) => {
    navigator.clipboard.writeText(JSON.stringify(error));
    notification.success({ message: "Descrição do erro copiada!" });
  };

  const reload = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();

    setLoading(true);

    const requestConfig = {
      idPatient,
      listToEscape: [],
      nameUrl: app.config.nameUrl,
      nameHeaders: app.config.nameHeaders,
      proxy: app.config.proxy,
      useCache: false,
      userRoles: [],
    };

    try {
      const patient = await hospital.getSinglePatient(
        access_token,
        requestConfig
      );

      setCurrentName(patient.name);
      setLoading(false);
      setName({ ...patient, cache: true });
    } catch (error) {
      DefaultModal.confirm({
        title: "Ocorreu um erro ao buscar o nome do paciente",
        content: (
          <>
            <p>
              Clique no texto abaixo para copiá-lo e nos envie através da Ajuda.
            </p>
            <Tooltip title="Clique para copiar a descrição do erro">
              <Textarea
                value={JSON.stringify(error)}
                style={{ minHeight: "200px" }}
                readOnly={true}
                onClick={() => copyError(error)}
              />
            </Tooltip>
          </>
        ),
        onOk: modalOk,
        okText: "Ajuda",
        cancelText: "Fechar",
        width: 500,
      });
      setLoading(false);
    }
  };

  return (
    <>
      {currentName || name}
      {name && name.indexOf("Paciente") !== -1 && (
        <Tooltip title="Recarregar nome do paciente">
          <Button
            shape="circle"
            icon={<ReloadOutlined />}
            style={{ marginLeft: "10px" }}
            onClick={reload}
            loading={loading}
          />
        </Tooltip>
      )}
    </>
  );
}
