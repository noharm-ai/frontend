import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Tabs, List, Alert } from "antd";
import { DownloadOutlined, InfoCircleOutlined } from "@ant-design/icons";

import DefaultModal from "components/Modal";
import Heading from "components/Heading";
import Descriptions from "components/Descriptions";
import Button from "components/Button";
import notification from "components/notification";
import Tooltip from "components/Tooltip";
import { Textarea } from "components/Inputs";
import { formatDateTime } from "utils/date";
import { pushQueueRequest, setQueueDrawer } from "../IntegrationRemoteSlice";
import { getErrorMessage } from "utils/errorHandler";
import { actionTypeToDescription } from "../transformer";

export default function QueueModal({ data, onCancel }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const activeAction = useSelector(
    (state) => state.admin.integrationRemote.pushQueueRequest.activeAction
  );

  const executeCustomEndpointState = (endpoint, method, params = {}) => {
    if (!endpoint) {
      notification.error({
        message: "Endpoint não encontrado",
      });
      return;
    }

    const payload = {
      endpoint: endpoint.replace(/http.*\/nifi-api/, "nifi-api"),
      method,
      actionType: "CUSTOM_CALLBACK",
      entity: data?.extra?.entity,
      idProcessor: 0,
      componentType: null,
      ...params,
    };
    dispatch(pushQueueRequest(payload)).then((response) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        notification.success({
          message: "Solicitação enviada. Aguarde a resposta.",
          placement: "bottom",
        });
        dispatch(setQueueDrawer(true));
      }
    });
  };

  const getDescriptions = (data) => {
    if (!data) return null;

    return (
      <Descriptions bordered size="small">
        {Object.keys(data).map((ki) => (
          <React.Fragment key={ki}>
            <Descriptions.Item label={ki} span={3}>
              {data[ki] instanceof Object
                ? getDescriptions(data[ki])
                : data[ki]}
            </Descriptions.Item>
          </React.Fragment>
        ))}
      </Descriptions>
    );
  };

  const items = [
    {
      key: "1",
      label: "Request",
      children: (
        <Descriptions bordered size="small">
          <Descriptions.Item label="Data" span={3}>
            {formatDateTime(data?.createdAt)}
          </Descriptions.Item>
          <Descriptions.Item label="Origem" span={3}>
            {data?.extra?.entity}
          </Descriptions.Item>
          <Descriptions.Item label="URL" span={3}>
            {data?.url}
          </Descriptions.Item>
          <Descriptions.Item label="METHOD" span={3}>
            {data?.method}
          </Descriptions.Item>
          <Descriptions.Item label="BODY" span={3}>
            {getDescriptions(data?.body)}
          </Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: "2",
      label: "Response",
      children: (
        <Descriptions bordered size="small">
          <Descriptions.Item label="Data" span={3}>
            {formatDateTime(data?.responseAt)}
          </Descriptions.Item>
          <Descriptions.Item label="Código" span={3}>
            {data?.responseCode}
          </Descriptions.Item>

          <Descriptions.Item label="Resposta" span={3}>
            <Textarea
              value={JSON.stringify(data?.response, null, 2)}
              style={{ minHeight: "150px" }}
            />
          </Descriptions.Item>
        </Descriptions>
      ),
    },
  ];

  if (
    data?.responseCode === 200 &&
    data?.response?.listingRequest?.flowFileSummaries
  ) {
    items.push({
      key: "3",
      label: "Fila",
      children: (
        <Descriptions bordered size="small">
          <Descriptions.Item label="Fila" span={3}>
            <List
              itemLayout="horizontal"
              dataSource={data?.response?.listingRequest?.flowFileSummaries}
              loading={false}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Tooltip title="Solicitar atributos">
                      <Button
                        icon={<InfoCircleOutlined />}
                        shape="circle"
                        loading={activeAction === "CUSTOM_CALLBACK"}
                        onClick={() =>
                          executeCustomEndpointState(item.uri, "GET", {
                            entity: "Ver atributos",
                          })
                        }
                      ></Button>
                    </Tooltip>,
                    <Tooltip title="Solicitar download do conteúdo">
                      <Button
                        icon={<DownloadOutlined />}
                        shape="circle"
                        loading={activeAction === "CUSTOM_CALLBACK"}
                        onClick={() =>
                          executeCustomEndpointState(
                            item.uri + "/content",
                            "GET"
                          )
                        }
                      ></Button>
                    </Tooltip>,
                  ]}
                >
                  <List.Item.Meta
                    title={item.uuid}
                    description={`Size: ${item.size}`}
                  />
                </List.Item>
              )}
            />
          </Descriptions.Item>
        </Descriptions>
      ),
    });
  }

  if (data?.responseCode === 200 && data?.response?.componentState) {
    items.push({
      key: "4",
      label: "Estado",
      children: (
        <Descriptions bordered size="small">
          <Descriptions.Item label="Chave" span={3}>
            {data?.response?.componentState?.localState?.state && (
              <>
                {data?.response?.componentState?.localState?.state.length
                  ? data?.response?.componentState?.localState?.state[0].key
                  : "Vazio"}
              </>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Valor" span={3}>
            {data?.response?.componentState?.localState?.state && (
              <>
                {data?.response?.componentState?.localState?.state.length
                  ? data?.response?.componentState?.localState?.state[0].value
                  : "Vazio"}
              </>
            )}
          </Descriptions.Item>
        </Descriptions>
      ),
    });
  }

  if (data?.responseCode === 200 && data?.response?.flowFile?.attributes) {
    items.push({
      key: "5",
      label: "Atributos",
      children: getDescriptions(data?.response?.flowFile?.attributes),
    });
  }

  if (data?.responseCode === 200 && data?.response?.provenance) {
    items.push({
      key: "3",
      label: "Data Provenance",
      children: (
        <Descriptions bordered size="small">
          <Descriptions.Item label="Fila" span={3}>
            <List
              itemLayout="horizontal"
              dataSource={data?.response?.provenance?.results.provenanceEvents}
              loading={false}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Tooltip title="Solicitar atributos">
                      <Button
                        icon={<InfoCircleOutlined />}
                        shape="circle"
                        loading={activeAction === "CUSTOM_CALLBACK"}
                        onClick={() =>
                          executeCustomEndpointState(
                            `nifi-api/provenance-events/${item.eventId}`,
                            "GET",
                            {
                              entity: "Ver atributos (data provenance)",
                            }
                          )
                        }
                      ></Button>
                    </Tooltip>,
                    <Tooltip title="Solicitar download do conteúdo">
                      <Button
                        icon={<DownloadOutlined />}
                        shape="circle"
                        loading={activeAction === "CUSTOM_CALLBACK"}
                        onClick={() =>
                          executeCustomEndpointState(
                            `nifi-api/provenance-events/${item.eventId}/content/output`,
                            "GET",
                            {
                              entity:
                                "Download content output (data provenance)",
                            }
                          )
                        }
                      ></Button>
                    </Tooltip>,
                  ]}
                >
                  <List.Item.Meta
                    title={item.eventTime}
                    description={item.eventType}
                  />
                </List.Item>
              )}
            />
          </Descriptions.Item>
        </Descriptions>
      ),
    });
  }

  return (
    <DefaultModal
      width={"60vw"}
      centered
      destroyOnHidden
      open={data}
      onCancel={onCancel}
      footer={null}
    >
      <Heading $margin="0 0 11px" $size="18px">
        {actionTypeToDescription(data?.extra?.type)}
      </Heading>

      {data?.response?.listingRequest &&
        !data?.response?.listingRequest?.finished && (
          <Alert
            message="Resposta assíncrona"
            description="Você deve utilizar o botão ao lado para fazer uma nova solicitação para trazer o conteúdo"
            type="warning"
            action={
              <Button
                type="primary"
                loading={activeAction === "CUSTOM_CALLBACK"}
                onClick={() =>
                  executeCustomEndpointState(
                    data?.response.listingRequest?.uri,
                    "GET"
                  )
                }
              >
                Solicitar resposta
              </Button>
            }
          />
        )}

      {data?.response?.dropRequest && (
        <Alert
          message="Resposta assíncrona"
          description="Atualiza a fila para garantir que a operação foi efetuada com sucesso."
          type="info"
        />
      )}

      <Tabs
        defaultActiveKey={
          data?.responseCode === 200 &&
          data?.response?.listingRequest?.flowFileSummaries
            ? "3"
            : "1"
        }
        items={items}
      />
    </DefaultModal>
  );
}
