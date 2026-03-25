import { useState } from "react";
import { Spin } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import axios from "axios";

import { usePatientName } from "hooks/usePatientName";
import Button from "components/Button";
import Tooltip from "components/Tooltip";
import DefaultModal from "components/Modal";
import Descriptions from "components/Descriptions";
import notification from "components/notification";
import { Textarea } from "components/Inputs";
import { setSupportOpen } from "features/support/SupportSlice";
import hospital from "services/hospital";
import { clearLoading } from "utils/patientCache";

interface Props {
  idPatient: number | string;
}

const httpErrorHandler = (error: unknown): string => {
  const log: string[] = [];

  log.push("=== ERRO AO BUSCAR NOME DO PACIENTE ===");
  log.push("Data/Hora: " + new Date().toISOString());
  log.push("Navegador: " + navigator.userAgent);

  if (error === null) {
    log.push("\nErro desconhecido (null)");
    return log.join("\n");
  }

  if (axios.isAxiosError(error)) {
    const response = error?.response;
    const config = error?.config;

    log.push("\n=== ERRO ===");
    log.push("Código: " + error.code);
    log.push("Mensagem: " + error.message);

    if (error.code === "ERR_NETWORK") {
      log.push(
        ">>>> O serviço está offline ou é inacessível a partir deste computador",
      );
    } else if (error.code === "ERR_CANCELED") {
      log.push(">>>> Requisição cancelada pelo usuário");
    } else if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      log.push(">>>> A requisição passou do tempo limite");
    }

    log.push("\n=== RESPOSTA ===");
    if (response) {
      log.push("Status: " + response.status);
      log.push("Dados: " + JSON.stringify(response.data));
    } else {
      log.push("O serviço não respondeu");
    }

    log.push("\n=== REQUISIÇÃO ===");
    if (config) {
      log.push("URL: " + config.url);
      log.push("Método: " + (config.method ?? "GET").toUpperCase());
      if (config.timeout) log.push("Timeout: " + config.timeout + "ms");
    }
  } else if (error instanceof Error) {
    log.push("\n=== ERRO ===");
    log.push("Mensagem: " + error.message);
    if (error.stack) log.push("Stack: " + error.stack);
  } else {
    log.push("\n=== ERRO ===");
    log.push("Detalhes: " + JSON.stringify(error));
  }

  return log.join("\n");
};

export default function PatientNameCache({ idPatient }: Props) {
  const { name, isLoading, data } = usePatientName(idPatient);
  const [reloadLoading, setReloadLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const appConfig = useSelector((state: any) => state.app.config);

  const baseUrl = `${appConfig.nameUrl}`.replace(
    "patient-name/{idPatient}",
    "",
  );

  const copyError = (error: unknown) => {
    const translated = httpErrorHandler(error);
    const detailed = JSON.stringify(
      error,
      Object.getOwnPropertyNames(error instanceof Error ? error : {}),
    );
    const content = `${translated}\n\n=== OBJETO DO ERRO ===\n${detailed}`;
    navigator.clipboard.writeText(content);
    notification.success({ message: "Descrição do erro copiada!" });
  };

  const modalOk = () => {
    dispatch(setSupportOpen(true));
    return null;
  };

  const reload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.nativeEvent as Event).stopImmediatePropagation();

    setReloadLoading(true);

    const requestConfig = {
      idPatient,
      listToEscape: [],
      nameUrl: appConfig.nameUrl,
      nameHeaders: appConfig.nameHeaders,
      proxy: appConfig.proxy,
      useCache: false,
      userRoles: [],
      features: [],
    };

    try {
      await hospital.getSinglePatient(null, requestConfig);
    } catch (error) {
      clearLoading([idPatient]);
      DefaultModal.confirm({
        title: "Ocorreu um erro ao buscar o nome do paciente",
        content: (
          <>
            <p>
              Clique no botão abaixo para acessar nosso artigo da Base de
              Conhecimento com o passo a passo para resolver o problema.
            </p>
            <Button
              type="default"
              href={`${import.meta.env.VITE_APP_ODOO_LINK}/knowledge/article/182`}
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
            {appConfig.getnameType !== "proxy" && (
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
        mask: { blur: false },
        onOk: modalOk,
        okText: "Ajuda",
        cancelText: "Fechar",
        width: 500,
      });
    } finally {
      setReloadLoading(false);
    }
  };

  const openModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setModalOpen(true);
  };

  if (isLoading && !name) return <Spin size="small" />;

  return (
    <>
      <Tooltip title={`ID do paciente: ${idPatient}. Clique para detalhes.`}>
        <span onClick={openModal} style={{ fontSize: 14, cursor: "pointer" }}>
          {name ?? `Paciente ${idPatient}`}
        </span>
      </Tooltip>

      {!name && (
        <Tooltip title="Recarregar nome do paciente">
          <Button
            shape="circle"
            icon={<ReloadOutlined />}
            style={{ marginLeft: "10px" }}
            onClick={reload}
            loading={reloadLoading}
          />
        </Tooltip>
      )}
      <DefaultModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        title={name ?? `Paciente ${idPatient}`}
        width={600}
        destroyOnHidden
      >
        <Descriptions bordered size="small" column={1}>
          <Descriptions.Item label="ID">{idPatient}</Descriptions.Item>

          {data &&
            Object.entries(data)
              .filter(([key]) => key !== "cache")
              .map(([key, value]) => (
                <Descriptions.Item
                  key={key}
                  label={t(`patientDetails.${key}`, { defaultValue: key })}
                >
                  {value !== null && value !== undefined ? String(value) : "—"}
                </Descriptions.Item>
              ))}
        </Descriptions>
      </DefaultModal>
    </>
  );
}
