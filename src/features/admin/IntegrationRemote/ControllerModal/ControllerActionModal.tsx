import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRightOutlined } from "@ant-design/icons";
import { Steps, Tag, Result, Spin, Popconfirm, Switch } from "antd";

import { useAppSelector, useAppDispatch } from "src/store";
import DefaultModal from "components/Modal";
import notification from "components/notification";
import Button from "components/Button";
import { pushQueueRequest } from "../IntegrationRemoteSlice";
import { getErrorMessage } from "src/utils/errorHandler";
import { ProcessorStatusList } from "./ProcessorStatusList";

interface IControllerActionModal {
  open: boolean;
  onCancel: () => void;
  data: {
    name: string;
    instanceIdentifier: string;
    componentType: string;
  };
}

export function ControllerActionModal({
  open,
  onCancel,
  data,
}: IControllerActionModal) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const queueList = useAppSelector(
    (state) => state.admin.integrationRemote.queue.list
  );
  const [currentQueueId, setCurrentQueueId] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [waitingQueueResponse, setWaitingQueueResponse] =
    useState<boolean>(false);
  const [queueResponse, setQueueResponse] = useState<any>(null);
  const [controllerStatus, setControllerStatus] = useState<any>(null);
  const [forcePool, setForcePool] = useState<boolean>(false);

  useEffect(() => {
    if (open) {
      setCurrentStep(0);
      setWaitingQueueResponse(false);
      setCurrentQueueId(null);
      setQueueResponse(null);
      setControllerStatus(null);
      setForcePool(false);
    }
  }, [open]);

  useEffect(() => {
    if (currentQueueId) {
      const currentQueue: any = queueList.find(
        (queue: any) => queue.id === currentQueueId
      );

      if (currentQueue && currentQueue.response) {
        setQueueResponse(currentQueue);
        setCurrentQueueId(null);
        setWaitingQueueResponse(false);

        if (currentQueue.extra?.type === "GET_CONTROLLER_REFERENCE") {
          setControllerStatus(currentQueue.response.status);
        }
      }
    }
  }, [queueList, currentQueueId]);

  const executeAction = (actionType: string, params: any = {}) => {
    const entity = data?.name;

    const payload = {
      idProcessor: data?.instanceIdentifier,
      actionType,
      componentType: data?.componentType,
      entity,
      ...params,
    };
    // @ts-expect-error ts 2554 (legacy code)
    return dispatch(pushQueueRequest(payload));
  };

  const steps = [
    {
      title: "Informações",
      content: (
        <>
          <p>
            O primeiro passo é verificar o status atual e os processos
            conectados neste controller.
          </p>
          <Switch
            onChange={(value) => setForcePool(value)}
            checked={forcePool}
          />{" "}
          <span style={{ marginLeft: "5px" }}>
            Este é um pool de conexão para o BD de produção da NoHarm?
          </span>
          {forcePool && (
            <>
              <h4>Para habilitar:</h4>
              <p>
                Utilize o botão abaixo para forçar a habilitação do controller.
                Os processos relacionados terão que ser habilitados manualmente.
              </p>
              <Popconfirm
                title="Forçar Habilitação"
                description="Utilizar apenas para o pool de conexão com a NoHarm"
                okText="Sim"
                cancelText="Não"
                onConfirm={() => setState("ENABLED", 99)}
                zIndex={9999}
              >
                <Button danger>Forçar habilitação</Button>
              </Popconfirm>

              <h4>Para desabilitar:</h4>
              <p>
                Siga os passos, mas lembre-se que após desabilitar os processos,
                o nifi remoto deixará de responder. Espere alguns minutos e
                depois avance para desabilitar o controller.
              </p>
            </>
          )}
        </>
      ),
    },
    {
      title: "Revisão",
      content: (
        <>
          {waitingQueueResponse ? (
            <LoadBox message="Carregando informações sobre o controller..." />
          ) : (
            <>
              <h4>Revise as informações abaixo:</h4>

              {queueResponse && (
                <>
                  <p>
                    Status do Controller:{" "}
                    {controllerStatus?.runStatus === "ENABLED" ? (
                      <Tag color="success">Habilitado</Tag>
                    ) : (
                      <Tag>Desabilitado</Tag>
                    )}
                    <br />
                    {controllerStatus?.validationStatus === "VALID"
                      ? ""
                      : "Controller inválido (verifique as configurações)"}
                  </p>
                  <h4 style={{ marginTop: "25px", marginBottom: 0 }}>
                    Processos relacionados:
                  </h4>

                  <ProcessorStatusList
                    controllers={
                      queueResponse?.response?.component
                        ?.referencingComponents || []
                    }
                  />
                </>
              )}
            </>
          )}
        </>
      ),
    },
    {
      title:
        controllerStatus?.runStatus === "DISABLED" ? "Processos" : "Controller",
      content: (
        <>
          {controllerStatus?.runStatus === "DISABLED" ? (
            <>
              {waitingQueueResponse ? (
                <LoadBox message="Habilitando o Controller..." />
              ) : (
                <>
                  <h3>Controller habilitado com sucesso!</h3>
                  <p>
                    Clique em avançar para iniciar os processos conectados ao
                    controller.
                  </p>
                  <ProcessorStatusList
                    controllers={
                      queueResponse?.response?.component
                        ?.referencingComponents || []
                    }
                  />
                </>
              )}
            </>
          ) : (
            <>
              {waitingQueueResponse ? (
                <>
                  <LoadBox
                    message={
                      forcePool
                        ? "Atualizando o estado dos processos. Aguarde alguns minutos e avance manualmente."
                        : "Atualizado estado dos processos..."
                    }
                  />
                </>
              ) : (
                <>
                  <h3>Processos parados com sucesso!</h3>
                  <p>
                    Agora você pode desabilitar o controller. Clique em avançar
                    para continuar.
                  </p>
                  <ProcessorStatusList
                    controllers={
                      queueResponse?.response
                        ?.controllerServiceReferencingComponents || []
                    }
                  />
                </>
              )}
            </>
          )}
        </>
      ),
    },
    {
      title: "Resultado",
      content: (
        <>
          {controllerStatus?.runStatus === "DISABLED" ? (
            <>
              {waitingQueueResponse ? (
                <LoadBox message="Iniciando os processos..." />
              ) : (
                <>
                  <Result
                    status="success"
                    title="Processos iniciados com sucesso"
                  />

                  <ProcessorStatusList
                    controllers={
                      queueResponse?.response
                        ?.controllerServiceReferencingComponents || []
                    }
                  />
                </>
              )}
            </>
          ) : (
            <>
              {waitingQueueResponse ? (
                <LoadBox
                  message={
                    forcePool
                      ? "Desabilitando o controller. Feche a popup manualmente."
                      : "Desabilitando o Controller..."
                  }
                />
              ) : (
                <>
                  <Result
                    status="success"
                    title="Controller desabilitado com sucesso"
                  />

                  <ProcessorStatusList
                    controllers={
                      queueResponse?.response.component
                        ?.referencingComponents || []
                    }
                  />
                </>
              )}
            </>
          )}
        </>
      ),
    },
  ];

  const footer = () => {
    if (currentStep === 0) {
      return (
        <Button
          type="primary"
          onClick={() => {
            getReferences();
          }}
          icon={<ArrowRightOutlined />}
        >
          Iniciar
        </Button>
      );
    }

    if (currentStep === 1) {
      if (controllerStatus?.runStatus === "ENABLED") {
        return (
          <Button
            type="primary"
            onClick={() => {
              putReferences("STOPPED", 2);
            }}
            disabled={waitingQueueResponse}
            icon={<ArrowRightOutlined />}
          >
            Parar processos e avançar
          </Button>
        );
      }

      return [
        <Button
          type="primary"
          onClick={() => {
            setState("ENABLED", 2);
          }}
          disabled={waitingQueueResponse}
          icon={<ArrowRightOutlined />}
        >
          Habilitar controller
        </Button>,
      ];
    }

    if (currentStep === 2) {
      if (controllerStatus?.runStatus === "DISABLED") {
        return (
          <Button
            type="primary"
            onClick={() => {
              putReferences("RUNNING", 3);
            }}
            disabled={waitingQueueResponse}
            icon={<ArrowRightOutlined />}
          >
            Iniciar processos
          </Button>
        );
      }

      return (
        <Button
          type="primary"
          onClick={() => {
            setState("DISABLED", 3);
          }}
          disabled={waitingQueueResponse && !forcePool}
          icon={<ArrowRightOutlined />}
        >
          Desabilitar Controller e Avançar
        </Button>
      );
    }

    if (currentStep === 3) {
      return (
        <Button
          disabled={waitingQueueResponse}
          onClick={() => {
            onCancel();
          }}
        >
          Fechar
        </Button>
      );
    }

    return null;
  };

  const getReferences = () => {
    executeAction("GET_CONTROLLER_REFERENCE").then((response: any) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        notification.success({
          message: "Solicitação enviada. Aguarde a resposta.",
          placement: "bottom",
        });

        setCurrentQueueId(response.payload.data.data.id);
        setCurrentStep(1);
        setWaitingQueueResponse(true);
      }
    });
  };

  const putReferences = (state: "STOPPED" | "RUNNING", goToStep: number) => {
    const referencingComponentRevisions: any = {};

    queueResponse?.response?.component?.referencingComponents?.forEach(
      (comp: any) => {
        referencingComponentRevisions[comp.id] = {
          clientId: comp.revision.clientId,
          version: comp.revision.version,
        };
      }
    );

    const payload = {
      id: data?.instanceIdentifier,
      state: state,
      referencingComponentRevisions: referencingComponentRevisions,
      disconnectedNodeAcknowledged: false,
      uiOnly: true,
    };

    executeAction("PUT_CONTROLLER_REFERENCE", { body: payload }).then(
      (response: any) => {
        if (response.error) {
          notification.error({
            message: getErrorMessage(response, t),
          });
        } else {
          notification.success({
            message: "Solicitação enviada. Aguarde a resposta.",
            placement: "bottom",
          });

          setCurrentQueueId(response.payload.data.data.id);
          setCurrentStep(goToStep);
          setWaitingQueueResponse(true);
        }
      }
    );
  };

  const setState = (state: "ENABLED" | "DISABLED", goToStep: number) => {
    const payload = {
      disconnectedNodeAcknowledged: false,
      state: state,
      uiOnly: true,
    };

    executeAction("SET_CONTROLLER_STATE", { body: payload }).then(
      (response: any) => {
        if (response.error) {
          notification.error({
            message: getErrorMessage(response, t),
          });
        } else {
          notification.success({
            message: "Solicitação enviada. Aguarde a resposta.",
            placement: "bottom",
          });

          if (goToStep === 99) {
            onCancel();
            return;
          }

          setCurrentQueueId(response.payload.data.data.id);
          setCurrentStep(goToStep);
          setWaitingQueueResponse(true);
        }
      }
    );
  };

  return (
    <DefaultModal
      width={"700px"}
      centered
      destroyOnClose
      open={open}
      onCancel={onCancel}
      footer={footer()}
      maskClosable={false}
    >
      <div className="modal-title">Alterar Status</div>

      <Steps items={steps} current={currentStep} />

      <div style={{ margin: "30px 0" }}>{steps[currentStep].content}</div>
    </DefaultModal>
  );
}

function LoadBox({ message }: { message: string }) {
  return (
    <Spin spinning={true} size="large">
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px",
          backgroundColor: "rgba(0, 0, 0, 0.05)'",
        }}
      >
        <p style={{ paddingTop: "80px" }}>{message}</p>
      </div>
    </Spin>
  );
}
