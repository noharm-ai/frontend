import { useState, useEffect } from "react";
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
    (state) => state.admin.integrationRemote.queue.list
  );
  const [currentQueueId, setCurrentQueueId] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [waitingQueueResponse, setWaitingQueueResponse] =
    useState<boolean>(false);

  const [controllerStatus, setControllerStatus] = useState<any>(null);
  const [controllerData, setControllerData] = useState<any>(null);
  const [forcePool, setForcePool] = useState<boolean>(false);

  useEffect(() => {
    if (open) {
      setCurrentStep(0);
      setWaitingQueueResponse(false);
      setCurrentQueueId(null);
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
        setCurrentQueueId(null);
        setWaitingQueueResponse(false);

        if (currentQueue.extra?.type === "GET_CONTROLLER_REFERENCE") {
          setControllerStatus(currentQueue.response.status);
          setControllerData(currentQueue.response);
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

        setCurrentQueueId(response.payload.data.data.id);
        setCurrentStep(2);
        setWaitingQueueResponse(true);
      }
    });
  };

  const toggleForcePool = (checked: boolean) => {
    setForcePool(checked);

    if (checked) {
      console.log("controllerdata", data);

      setControllerData({ component: data });
      setControllerStatus({ runStatus: "unknown" });
    } else {
      setControllerData(null);
      setControllerStatus(null);
    }
  };

  const steps = [
    {
      title: "Informações",
      content: (
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
      ),
    },
    {
      title: "Formulário",
      content: (
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
      ),
    },
    {
      title: "Resultado",
      content: (
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
      ),
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
      destroyOnClose
      open={open}
      onCancel={onCancel}
      footer={footer()}
      maskClosable={false}
    >
      <div className="modal-title">Alterar Propriedades</div>

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
