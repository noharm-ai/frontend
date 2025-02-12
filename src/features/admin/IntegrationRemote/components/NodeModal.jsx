import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Tabs, Popconfirm, Space } from "antd";
import {
  DeleteOutlined,
  SearchOutlined,
  SaveOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { Formik } from "formik";
import { isEmpty } from "lodash";

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
import { Textarea, Select } from "components/Inputs";
import RichTextView from "components/RichTextView";

export default function NodeModal() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const data = useSelector(
    (state) => state.admin.integrationRemote.selectedNode
  );
  const activeAction = useSelector(
    (state) => state.admin.integrationRemote.pushQueueRequest.activeAction
  );

  const isUpdatable =
    ["Stopped", "Invalid", "Disabled"].indexOf(data?.status?.runStatus) !== -1;
  const statusOptions = () => {
    if (data?.status?.runStatus === "Disabled") {
      return [
        {
          key: "STOPPED",
          label: <>Enable</>,
        },
      ];
    }

    return [
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
  };

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

  const initialValues = { ...data?.extra?.properties };

  const footerActions = (handleSubmit) => {
    if (data?.extra?.componentType !== "PROCESSOR") {
      return null;
    }

    const actions = [
      <Button
        loading={activeAction === "VIEW_PROVENANCE"}
        icon={<SearchOutlined />}
        onClick={() => executeAction("VIEW_PROVENANCE")}
      >
        Data provenance
      </Button>,
      <Button
        loading={activeAction === "VIEW_STATE"}
        icon={<SearchOutlined />}
        onClick={() => executeAction("VIEW_STATE")}
      >
        Visualizar estado
      </Button>,
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
    ];

    if (isUpdatable) {
      actions.push(
        <Popconfirm
          key="updateProperty"
          title="Salvar propriedades"
          description="Esta ação salva as alterações nas propriedades do processo. Confirma?"
          okText="Sim"
          cancelText="Não"
          onConfirm={handleSubmit}
        >
          <Button
            icon={<SaveOutlined />}
            type="primary"
            disabled={!isUpdatable}
            loading={activeAction === "UPDATE_PROPERTY"}
          >
            Salvar propriedades
          </Button>
        </Popconfirm>
      );
    } else {
      actions.push(
        <Button
          icon={<StopOutlined />}
          type="primary"
          loading={activeAction === "SET_STATE"}
          onClick={() => executeAction("SET_STATE", { state: "STOPPED" })}
        >
          Parar e configurar
        </Button>
      );
    }

    return actions;
  };

  const getItems = (setFieldValue, values) => [
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
                    items: statusOptions(),
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
              {Object.hasOwn(data?.extra?.properties, "SQL select query") && (
                <Descriptions.Item label="SQL select query" span={3}>
                  <Textarea
                    value={values["SQL select query"]}
                    style={{ height: "3rem" }}
                    disabled={!isUpdatable}
                    onChange={({ target }) =>
                      setFieldValue("SQL select query", target.value)
                    }
                  />
                </Descriptions.Item>
              )}
              {Object.hasOwn(data?.extra?.properties, "db-fetch-sql-query") && (
                <Descriptions.Item
                  label="Custom query (db-fetch-sql-query)"
                  span={3}
                >
                  <Textarea
                    value={values["db-fetch-sql-query"]}
                    style={{ height: "3rem" }}
                    disabled={!isUpdatable}
                    onChange={({ target }) =>
                      setFieldValue("db-fetch-sql-query", target.value)
                    }
                  />
                </Descriptions.Item>
              )}
              {Object.hasOwn(
                data?.extra?.properties,
                "db-fetch-where-clause"
              ) && (
                <Descriptions.Item
                  label="Additional WHERE clause (db-fetch-where-clause)"
                  span={3}
                >
                  <Textarea
                    value={values["db-fetch-where-clause"]}
                    style={{ height: "3rem" }}
                    disabled={!isUpdatable}
                    onChange={({ target }) =>
                      setFieldValue("db-fetch-where-clause", target.value)
                    }
                  />
                </Descriptions.Item>
              )}
              {Object.hasOwn(data?.extra?.properties, "Table Name") && (
                <Descriptions.Item label="Table Name" span={3}>
                  <Textarea
                    style={{ height: "3rem" }}
                    disabled={!isUpdatable}
                    value={values["Table Name"]}
                    onChange={({ target }) =>
                      setFieldValue("Table Name", target.value)
                    }
                  />
                </Descriptions.Item>
              )}
              {Object.hasOwn(data?.extra?.properties, "Columns to Return") && (
                <Descriptions.Item label="Columns to Return" span={3}>
                  <Textarea
                    value={values["Columns to Return"]}
                    style={{ height: "3rem" }}
                    disabled={!isUpdatable}
                    onChange={({ target }) =>
                      setFieldValue("Columns to Return", target.value)
                    }
                  />
                </Descriptions.Item>
              )}
              {Object.hasOwn(
                data?.extra?.properties,
                "Maximum-value Columns"
              ) && (
                <Descriptions.Item label="Maximum-value Columns" span={3}>
                  <Textarea
                    style={{ height: "3rem" }}
                    disabled={!isUpdatable}
                    value={values["Maximum-value Columns"]}
                    onChange={({ target }) =>
                      setFieldValue("Maximum-value Columns", target.value)
                    }
                  />
                </Descriptions.Item>
              )}
              {Object.hasOwn(data?.extra?.properties, "Max Wait Time") && (
                <Descriptions.Item label="Max Wait Time" span={3}>
                  <Textarea
                    style={{ height: "3rem" }}
                    disabled={!isUpdatable}
                    value={values["Max Wait Time"]}
                    onChange={({ target }) =>
                      setFieldValue("Max Wait Time", target.value)
                    }
                  />
                </Descriptions.Item>
              )}
              {Object.hasOwn(data?.extra?.properties, "qdbt-max-rows") && (
                <Descriptions.Item
                  label="Max Rows Per Flow File (qdbt-max-rows)"
                  span={3}
                >
                  <Textarea
                    style={{ height: "3rem" }}
                    disabled={!isUpdatable}
                    value={values["qdbt-max-rows"]}
                    onChange={({ target }) =>
                      setFieldValue("qdbt-max-rows", target.value)
                    }
                  />
                </Descriptions.Item>
              )}

              {Object.hasOwn(
                data?.extra?.properties,
                "put-db-record-statement-type"
              ) && (
                <Descriptions.Item
                  label="Statement type (put-db-record-statement-type)"
                  span={3}
                >
                  <Select
                    value={values["put-db-record-statement-type"]}
                    onChange={(value) =>
                      setFieldValue("put-db-record-statement-type", value)
                    }
                    style={{ minWidth: "300px" }}
                    disabled={!isUpdatable}
                  >
                    <Select.Option value="INSERT">INSERT</Select.Option>
                    <Select.Option value="UPDATE">UPDATE</Select.Option>
                    <Select.Option value="UPSERT">UPSERT</Select.Option>
                    <Select.Option value="INSERT_IGNORE">
                      INSERT_IGNORE
                    </Select.Option>
                    <Select.Option value="DELETE">DELETE</Select.Option>
                  </Select>
                </Descriptions.Item>
              )}

              {Object.hasOwn(
                data?.extra?.properties,
                "put-db-record-update-keys"
              ) && (
                <Descriptions.Item
                  label="Update keys (put-db-record-update-keys)"
                  span={3}
                >
                  <Textarea
                    style={{ height: "3rem" }}
                    disabled={!isUpdatable}
                    value={values["put-db-record-update-keys"]}
                    onChange={({ target }) =>
                      setFieldValue("put-db-record-update-keys", target.value)
                    }
                  />
                </Descriptions.Item>
              )}

              {Object.hasOwn(
                data?.extra?.properties,
                "put-db-record-table-name"
              ) && (
                <Descriptions.Item
                  label="Table name (put-db-record-table-name)"
                  span={3}
                >
                  <Textarea
                    style={{ height: "3rem" }}
                    disabled={!isUpdatable}
                    value={values["put-db-record-table-name"]}
                    onChange={({ target }) =>
                      setFieldValue("put-db-record-table-name", target.value)
                    }
                  />
                </Descriptions.Item>
              )}

              {Object.hasOwn(
                data?.extra?.properties,
                "generate-ff-custom-text"
              ) && (
                <Descriptions.Item
                  label="Custom text (generate-ff-custom-text)"
                  span={3}
                >
                  <Textarea
                    style={{ height: "3rem" }}
                    disabled={!isUpdatable}
                    value={values["generate-ff-custom-text"]}
                    onChange={({ target }) =>
                      setFieldValue("generate-ff-custom-text", target.value)
                    }
                  />
                </Descriptions.Item>
              )}

              {Object.hasOwn(data?.extra?.properties, "Remote URL") && (
                <Descriptions.Item label="Remote URL" span={3}>
                  <Textarea
                    style={{ height: "3rem" }}
                    disabled={!isUpdatable}
                    value={values["Remote URL"]}
                    onChange={({ target }) =>
                      setFieldValue("Remote URL", target.value)
                    }
                  />
                </Descriptions.Item>
              )}
              {data?.extra && data?.extra["schedulingPeriod"] && (
                <Descriptions.Item label="Agendamento" span={3}>
                  {data?.extra["schedulingPeriod"]} (
                  {data?.extra["schedulingStrategy"]})
                </Descriptions.Item>
              )}
              {data?.extra && data?.extra["comments"] && (
                <Descriptions.Item label="Comentários" span={3}>
                  <RichTextView text={data?.extra["comments"]} />
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

  const onSave = (params) => {
    const payload = {};

    const validFields = [
      "Maximum-value Columns",
      "Max Wait Time",
      "qdbt-max-rows",
      "Remote URL",
      "SQL select query",
      "db-fetch-sql-query",
      "db-fetch-where-clause",
      "Table Name",
      "put-db-record-statement-type",
      "put-db-record-update-keys",
      "put-db-record-table-name",
      "generate-ff-custom-text",
      "Columns to Return",
    ];

    validFields.forEach((field) => {
      if (Object.hasOwn(params, field)) {
        payload[field] = params[field] === "" ? null : params[field];
      }
    });

    if (!isEmpty(payload)) {
      executeAction("UPDATE_PROPERTY", { properties: payload });
    }
  };

  return (
    <Formik enableReinitialize onSubmit={onSave} initialValues={initialValues}>
      {({ handleSubmit, setFieldValue, values }) => (
        <DefaultModal
          width={"60vw"}
          centered
          destroyOnClose
          open={data}
          onCancel={() => dispatch(setSelectedNode(null))}
          footer={footerActions(handleSubmit)}
        >
          <Heading $margin="0 0 11px" $size="18px">
            {data?.name}
          </Heading>

          <Tabs defaultActiveKey="0" items={getItems(setFieldValue, values)} />
        </DefaultModal>
      )}
    </Formik>
  );
}
