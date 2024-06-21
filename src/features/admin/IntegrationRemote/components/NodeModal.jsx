import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Tabs, Popconfirm, Space } from "antd";
import {
  ReloadOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";

import DefaultModal from "components/Modal";
import Heading from "components/Heading";
import Descriptions from "components/Descriptions";
import notification from "components/notification";
import Dropdown from "components/Dropdown";
import Button from "components/Button";
import { getErrorMessage } from "utils/errorHandler";
import {
  setSelectedNode,
  setQueueDrawer,
  pushQueueRequest,
} from "../IntegrationRemoteSlice";
import NodeStatusTag from "./NodeStatusTag";
import { Textarea } from "components/Inputs";

export default function NodeModal() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const data = useSelector(
    (state) => state.admin.integrationRemote.selectedNode
  );
  const activeAction = useSelector(
    (state) => state.admin.integrationRemote.pushQueueRequest.activeAction
  );

  const statusOptions = [
    {
      key: "DISABLED",
      label: <>Disable</>,
    },

    {
      key: "RUNNING",
      label: <>Run</>,
    },
    {
      key: "RUN_ONCE",
      label: <>Run Once</>,
    },
    {
      key: "STOPPED",
      label: <>Stop</>,
    },
    {
      key: "TERMINATE",
      label: <>Terminate</>,
      danger: true,
    },
  ];

  const executeAction = (actionType, params = {}) => {
    let entity = data?.name;
    if (data?.extra?.componentType === "CONNECTION") {
      entity = `${data?.extra?.source?.name} -> ${data?.extra?.destination?.name}`;
    }

    const payload = {
      idProcessor: data.extra.instanceIdentifier,
      actionType,
      componentType: data?.extra?.componentType,
      entity,
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

  const items = [
    {
      key: "0",
      label: "Principal",
      children: (
        <Descriptions size="small" bordered>
          <Descriptions.Item label="Nome" span={3}>
            {data?.name}
          </Descriptions.Item>

          {data?.extra?.componentType === "PROCESSOR" && (
            <>
              <Descriptions.Item label="Tipo" span={3}>
                {data?.extra.type}
              </Descriptions.Item>
              <Descriptions.Item label="Status" span={3}>
                <Dropdown
                  trigger={["click"]}
                  menu={{
                    items: statusOptions,
                    onClick: (info) => {
                      if (info.key === "TERMINATE") {
                        executeAction("TERMINATE_PROCESS");
                      } else {
                        executeAction("SET_STATE", { state: info.key });
                      }
                    },
                  }}
                >
                  <NodeStatusTag
                    status={data?.status?.runStatus}
                    loading={
                      activeAction === "SET_STATE" ||
                      activeAction === "TERMINATE_PROCESS"
                    }
                  />
                </Dropdown>
              </Descriptions.Item>
              {data?.extra?.properties &&
                data?.extra?.properties["SQL select query"] && (
                  <Descriptions.Item label="SQL select query" span={3}>
                    <Textarea
                      value={data?.extra?.properties["SQL select query"]}
                      style={{ minHeight: "150px", maxHeight: "300px" }}
                    />
                  </Descriptions.Item>
                )}
              {data?.extra?.properties &&
                data?.extra?.properties["db-fetch-sql-query"] && (
                  <Descriptions.Item label="db-fetch-sql-query" span={3}>
                    <Textarea
                      value={data?.extra?.properties["db-fetch-sql-query"]}
                      style={{ minHeight: "150px", maxHeight: "300px" }}
                    />
                  </Descriptions.Item>
                )}
              {data?.extra?.properties &&
                data?.extra?.properties["Table Name"] && (
                  <Descriptions.Item label="Table Name" span={3}>
                    {data?.extra?.properties["Table Name"]}
                  </Descriptions.Item>
                )}
              {data?.extra?.properties &&
                data?.extra?.properties["Maximum-value Columns"] && (
                  <Descriptions.Item label="Maximum-value Columns" span={3}>
                    {data?.extra?.properties["Maximum-value Columns"]}
                  </Descriptions.Item>
                )}
              {data?.extra?.properties &&
                data?.extra?.properties["Remote URL"] && (
                  <Descriptions.Item label="Remote URL" span={3}>
                    <Textarea
                      value={data?.extra?.properties["Remote URL"]}
                      style={{ minHeight: "150px", maxHeight: "300px" }}
                    />
                  </Descriptions.Item>
                )}
              {data?.extra && data?.extra["schedulingPeriod"] && (
                <Descriptions.Item label="Agendamento" span={3}>
                  {data?.extra["schedulingPeriod"]}
                </Descriptions.Item>
              )}
              {data?.status && data?.status["activeThreadCount"] >= 0 && (
                <Descriptions.Item label="Threads ativas" span={3}>
                  {data?.status["activeThreadCount"]}
                </Descriptions.Item>
              )}
            </>
          )}
          {data?.extra?.componentType === "CONNECTION" && (
            <>
              <Descriptions.Item label="Origem" span={3}>
                {data?.extra?.source?.name}
              </Descriptions.Item>
              <Descriptions.Item label="Destino" span={3}>
                {data?.extra?.destination?.name}
              </Descriptions.Item>
              <Descriptions.Item label="Fila" span={3}>
                <div>
                  <Space>
                    <div>{data?.status?.queued}</div>
                    <Button
                      icon={<SearchOutlined />}
                      loading={activeAction === "LIST_QUEUE"}
                      onClick={() => executeAction("LIST_QUEUE")}
                    >
                      Solicitar fila
                    </Button>
                    <Popconfirm
                      key="clearState"
                      title="Limpar fila"
                      description="Esta ação remove todos os registros da fila. Confirma?"
                      okText="Sim"
                      cancelText="Não"
                      onConfirm={() => executeAction("CLEAR_QUEUE")}
                    >
                      <Button
                        icon={<DeleteOutlined />}
                        loading={activeAction === "CLEAR_QUEUE"}
                        danger
                      >
                        Limpar fila
                      </Button>
                    </Popconfirm>
                  </Space>
                </div>
              </Descriptions.Item>
            </>
          )}
        </Descriptions>
      ),
    },
    {
      key: "1",
      label: "Propriedades",
      children: (
        <Descriptions bordered size="small">
          {data?.extra &&
            Object.keys(data.extra).map((k) => (
              <React.Fragment key={k}>
                {k !== "properties" && k !== "propertyDescriptors" && (
                  <Descriptions.Item label={k} span={3}>
                    {data.extra[k] instanceof Object
                      ? JSON.stringify(data.extra[k])
                      : data.extra[k]}
                  </Descriptions.Item>
                )}
              </React.Fragment>
            ))}
          {data?.extra?.properties &&
            Object.keys(data.extra?.properties).map((k) => (
              <Descriptions.Item label={k} span={3} key={k}>
                {data.extra[k]?.properties instanceof Object
                  ? ""
                  : typeof data.extra?.properties[k] === "object"
                  ? JSON.stringify(data.extra?.properties[k])
                  : data.extra?.properties[k]}
              </Descriptions.Item>
            ))}
        </Descriptions>
      ),
    },
    {
      key: "3",
      label: "Diagnóstico",
      children: (
        <Descriptions bordered size="small">
          {data?.status &&
            Object.keys(data.status).map((k) => (
              <Descriptions.Item label={k} span={3} key={k}>
                {data.status[k] instanceof Object ? "" : data.status[k]}
              </Descriptions.Item>
            ))}
        </Descriptions>
      ),
    },
  ];

  return (
    <DefaultModal
      width={"60vw"}
      centered
      destroyOnClose
      open={data}
      onCancel={() => dispatch(setSelectedNode(null))}
      footer={[
        <Popconfirm
          key="clearState"
          title="Limpar estado"
          description="Esta ação limpa o maxcolumn do processo. Confirma?"
          okText="Sim"
          cancelText="Não"
          onConfirm={() => executeAction("CLEAR_STATE")}
        >
          <Button
            loading={activeAction === "CLEAR_STATE"}
            icon={<DeleteOutlined />}
            danger
          >
            Limpar estado
          </Button>
        </Popconfirm>,
        <Button
          key="back"
          onClick={() => executeAction("REFRESH_STATE")}
          icon={<ReloadOutlined />}
          type="primary"
          loading={activeAction === "REFRESH_STATE"}
        >
          Atualizar
        </Button>,
      ]}
    >
      <Heading margin="0 0 11px" size="18px">
        {data?.name}
      </Heading>

      <Tabs defaultActiveKey="0" items={items} />
    </DefaultModal>
  );
}
