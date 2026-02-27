import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRightOutlined } from "@ant-design/icons";
import { Steps, Result, Spin, Switch } from "antd";

import { useAppSelector, useAppDispatch } from "src/store";
import DefaultModal from "components/Modal";
import notification from "components/notification";
import Button from "components/Button";
import { pushQueueRequest } from "../IntegrationRemoteSlice";
import { getErrorMessage } from "src/utils/errorHandler";
import { ControllerForm } from "./ControllerForm";

interface IControllerActionModal {
  open: boolean;
  onCancel: () => void;
  data: {
    name: string;
    instanceIdentifier: string;
    componentType: string;
  };
}

export function ControllerEditModal({
  open,
  onCancel,
  data,
}: IControllerActionModal) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const queueList = useAppSelector(
    (state) => state.admin.integrationRemote.queue.list,
  );
  const currentQueueId = useRef<number | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [forcePool, setForcePool] = useState<boolean>(false);
  const [queueResult, setQueueResult] = useState<{
    waitingQueueResponse: boolean;
    controllerStatus: any;
    controllerData: any;
  }>({
    waitingQueueResponse: false,
    controllerStatus: null,
    controllerData: null,
  });

  const { waitingQueueResponse, controllerStatus, controllerData } =
    queueResult;

  useEffect(() => {
    if (!currentQueueId.current) return;

    const currentQueue: any = queueList.find(
      (queue: any) => queue.id === currentQueueId.current,
    );

    if (currentQueue && currentQueue.response) {
      currentQueueId.current = null;

      if (currentQueue.extra?.type === "GET_CONTROLLER_REFERENCE") {
        setQueueResult({
          waitingQueueResponse: false,
          controllerStatus: currentQueue.response.status,
          controllerData: currentQueue.response,
        });
      } else {
        setQueueResult((prev) => ({ ...prev, waitingQueueResponse: false }));
      }
    }
  }, [queueList]);

  const cleanState = () => {
    setCurrentStep(0);
    currentQueueId.current = null;
    setQueueResult({
      waitingQueueResponse: false,
      controllerStatus: null,
      controllerData: null,
    });
    setForcePool(false);
  };

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

        currentQueueId.current = response.payload.data.data.id;
        setCurrentStep(1);
        setQueueResult((prev) => ({ ...prev, waitingQueueResponse: true }));
      }
    });
  };

  const saveControllerData = (properties: any) => {
    const entity = data?.name;

    const payload = {
      idProcessor: data?.instanceIdentifier,
      actionType: "UPDATE_PROPERTY",
      componentType: data?.componentType,
      entity,
      body: {
        disconnectedNodeAcknowledged: false,
        component: {
          id: data?.instanceIdentifier,
          properties: properties,
        },
      },
    };

    executeAction("UPDATE_PROPERTY", payload).then((response: any) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        notification.success({
          message: "Solicitação enviada. Aguarde a resposta.",
          placement: "bottom",
        });

        currentQueueId.current = response.payload.data.data.id;
        setCurrentStep(2);
        setQueueResult((prev) => ({ ...prev, waitingQueueResponse: true }));
      }
    });
  };

  const toggleForcePool = (checked: boolean) => {
    setForcePool(checked);

    if (checked) {
      console.log("controllerdata", data);

      setQueueResult((prev) => ({
        ...prev,
        controllerData: { component: data },
        controllerStatus: { runStatus: "unknown" },
      }));
    } else {
      setQueueResult((prev) => ({
        ...prev,
        controllerData: null,
        controllerStatus: null,
      }));
    }
  };

  const steps = [
    {
      title: "Informações",
    },
    {
      title: "Formulário",
    },
    {
      title: "Resultado",
    },
  ];

  const footer = () => {
    if (currentStep === 0) {
      const start = () => {
        if (forcePool) {
          setCurrentStep(1);
        } else {
          getReferences();
        }
      };

      return (
        <Button
          type="primary"
          onClick={() => {
            start();
          }}
          disabled={waitingQueueResponse}
          icon={<ArrowRightOutlined />}
        >
          Iniciar
        </Button>
      );
    }

    if (currentStep === 2) {
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

  return (
    <DefaultModal
      width={"700px"}
      centered
      destroyOnHidden
      open={open}
      onCancel={onCancel}
      footer={footer()}
      maskClosable={false}
      afterClose={() => cleanState()}
    >
      <div className="modal-title">Alterar Propriedades</div>

      <Steps items={steps} current={currentStep} />

      <div style={{ margin: "30px 0" }}>
        {currentStep === 0 && (
          <>
            <p>
              O primeiro passo é verificar o status atual e as propriedades
              atualizadas do controller.
            </p>
            <Switch
              onChange={(value) => toggleForcePool(value)}
              checked={forcePool}
            />{" "}
            <span style={{ marginLeft: "5px" }}>
              Este é um pool de conexão para o BD de produção da NoHarm?
            </span>
          </>
        )}

        {currentStep === 1 && (
          <>
            {waitingQueueResponse ? (
              <LoadBox message="Carregando informações sobre o controller..." />
            ) : (
              <ControllerForm
                controllerData={controllerData}
                saveControllerData={saveControllerData}
                controllerStatus={controllerStatus}
                forcePool={forcePool}
              />
            )}
          </>
        )}

        {currentStep === 2 && (
          <>
            <>
              {waitingQueueResponse ? (
                <LoadBox
                  message={
                    forcePool
                      ? "Aguarde alguns minutos, feche a janela e execute o processo parado no grupo do Nifi remoto"
                      : "Aguardando resposta..."
                  }
                />
              ) : (
                <>
                  <Result
                    status="success"
                    title="Controller atualizado com sucesso"
                  />
                </>
              )}
            </>
          </>
        )}
      </div>
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
