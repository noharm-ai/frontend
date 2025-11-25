import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ReloadOutlined } from "@ant-design/icons";
import axios from "axios";

import Tooltip from "components/Tooltip";
import Button from "components/Button";
import hospital from "services/hospital";
import DefaultModal from "components/Modal";
import notification from "components/notification";
import { Textarea } from "components/Inputs";
import { setSupportOpen } from "features/support/SupportSlice";

export default function PatientName({
  idPatient,
  name,
  setName,
  app,
  access_token,
}) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [currentName, setCurrentName] = useState(null);
  const endpointConfig = useSelector((state) => state.app.config);
  const baseUrl = `${endpointConfig.nameUrl}`.replace(
    "patient-name/{idPatient}",
    ""
  );

  const modalOk = () => {
    dispatch(setSupportOpen(true));

    return null;
  };

  const copyError = (error) => {
    navigator.clipboard.writeText(JSON.stringify(error));
    notification.success({ message: "Descrição do erro copiada!" });
  };

  const httpErrorHandler = (error) => {
    const log = [];
    if (error === null) {
      log.push("Error is null!");
      return log;
    }

    if (axios.isAxiosError(error)) {
      const response = error?.response;
      const request = error?.request;

      log.push("Código do erro: " + error.code);

      if (error.code === "ERR_NETWORK") {
        log.push(
          ">>>> O serviço está offline ou é inacessível a partir deste computador"
        );
      }

      if (error.code === "ERR_CANCELED") {
        log.push(">>>> Requisição cancelada pelo usuário");
      }

      if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
        log.push(">>>> A requisição passou do tempo limite");
      }

      log.push("- RESPONSE INFO");
      if (response) {
        log.push("Status: " + response.status);
        log.push("Data: " + JSON.stringify(response.data));
      } else {
        log.push("O serviço não respondeu");
      }

      log.push("- REQUEST INFO");
      if (request) {
        log.push("Object:" + JSON.stringify(request));
      }
    }

    return log.join("\n");
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
      features: [],
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
              O botão abaixo abre um artigo da nossa base de conhecimento que
              possui alguns passos que podem ajudar a resolver o problema:
            </p>
            <Button
              type="default"
              href={`${
                import.meta.env.VITE_APP_ODOO_LINK
              }/knowledge/article/182`}
              target="_blank"
              size="large"
              block
            >
              Base de Conhecimento
            </Button>
            <p>
              Caso os passos do artigo acima não tenham efeito, clique no texto
              abaixo para copiá-lo e nos envie através da Ajuda.
            </p>
            <Tooltip title="Clique para copiar a descrição do erro">
              <Textarea
                value={httpErrorHandler(error)}
                style={{ minHeight: "200px" }}
                readOnly={true}
                onClick={() => copyError(error)}
              />
            </Tooltip>
            {app.config.getnameType !== "proxy" && (
              <>
                <p>Além disso, informe o conteúdo da janela abaixo:</p>
                <iframe
                  id="status_iframe"
                  title="getname"
                  style={{
                    border: 0,
                    width: "100%",
                    height: "100px",
                    background: "#fafafa",
                  }}
                  src={baseUrl}
                ></iframe>
              </>
            )}
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

  // const executeCacheClear = async () => {
  //   cleanCache();

  //   const urlRequest = endpointConfig.nameUrl.replace("{idPatient}", "clear");

  //   try {
  //     await axios.get(urlRequest, {
  //       timeout: 8000,
  //       headers: endpointConfig.nameHeaders,
  //     });
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  return (
    <>
      <Tooltip title={`ID do paciente: ${idPatient}`}>
        {currentName || name}
      </Tooltip>

      {/* {name && name.indexOf("Paciente") !== -1 && ( */}
      <Tooltip title="Recarregar nome do paciente">
        <Button
          shape="circle"
          icon={<ReloadOutlined />}
          style={{ marginLeft: "10px" }}
          onClick={reload}
          loading={loading}
        />
      </Tooltip>
      {/* )} */}
    </>
  );
}
