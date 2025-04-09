import { Descriptions, Space, Popconfirm } from "antd";
import { DeleteOutlined, SearchOutlined } from "@ant-design/icons";

import Dropdown from "components/Dropdown";
import { Textarea, Select } from "components/Inputs";
import Button from "components/Button";
import NodeStatusTag from "../components/NodeStatusTag";
import { INodeData } from "./NodeModal";

interface IMainTabProps {
  data: INodeData;
  activeAction: string | null;
  isUpdatable: boolean;
  values: any;
  setFieldValue: (key: string, value: any) => void;
  executeAction: (action: string, payload?: any) => void;
}

export function MainTab({
  data,
  activeAction,
  isUpdatable,
  values,
  setFieldValue,
  executeAction,
}: IMainTabProps) {
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

  const hasProp = (object: any, prop: string) =>
    Object.prototype.hasOwnProperty.call(object, prop);

  return (
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
          {data?.extra && data?.extra["schedulingPeriod"] && (
            <Descriptions.Item label="Agendamento" span={3}>
              <Textarea
                value={values["schedulingPeriod"]}
                style={{ height: "3rem" }}
                disabled={!isUpdatable}
                onChange={({ target }) =>
                  setFieldValue("schedulingPeriod", target.value)
                }
              />
            </Descriptions.Item>
          )}
          {data?.extra && data?.extra["schedulingStrategy"] && (
            <Descriptions.Item label="Estratégia de agendamento" span={3}>
              {data?.extra["schedulingStrategy"]}
            </Descriptions.Item>
          )}

          {hasProp(data?.extra?.properties, "SQL select query") && (
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
          {hasProp(data?.extra?.properties, "db-fetch-sql-query") && (
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
          {hasProp(data?.extra?.properties, "db-fetch-where-clause") && (
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
          {hasProp(data?.extra?.properties, "Table Name") && (
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
          {hasProp(data?.extra?.properties, "Columns to Return") && (
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
          {hasProp(data?.extra?.properties, "Maximum-value Columns") && (
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
          {hasProp(data?.extra?.properties, "Max Wait Time") && (
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
          {hasProp(data?.extra?.properties, "qdbt-max-rows") && (
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

          {hasProp(data?.extra?.properties, "put-db-record-statement-type") && (
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

          {hasProp(data?.extra?.properties, "put-db-record-update-keys") && (
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

          {hasProp(data?.extra?.properties, "put-db-record-table-name") && (
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

          {hasProp(data?.extra?.properties, "put-db-record-query-timeout") && (
            <Descriptions.Item
              label="Max Wait Time (put-db-record-query-timeout)"
              span={3}
            >
              <Textarea
                style={{ height: "3rem" }}
                disabled={!isUpdatable}
                value={values["put-db-record-query-timeout"]}
                onChange={({ target }) =>
                  setFieldValue("put-db-record-query-timeout", target.value)
                }
              />
            </Descriptions.Item>
          )}

          {hasProp(data?.extra?.properties, "generate-ff-custom-text") && (
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

          {hasProp(data?.extra?.properties, "Remote URL") && (
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

          {hasProp(data?.extra?.properties, "Connection Timeout") && (
            <Descriptions.Item label="Socket Connect Timeout" span={3}>
              <Textarea
                style={{ height: "3rem" }}
                disabled={!isUpdatable}
                value={values["Connection Timeout"]}
                onChange={({ target }) =>
                  setFieldValue("Connection Timeout", target.value)
                }
              />
            </Descriptions.Item>
          )}

          {hasProp(data?.extra?.properties, "Read Timeout") && (
            <Descriptions.Item label="Socket Read Timeout" span={3}>
              <Textarea
                style={{ height: "3rem" }}
                disabled={!isUpdatable}
                value={values["Read Timeout"]}
                onChange={({ target }) =>
                  setFieldValue("Read Timeout", target.value)
                }
              />
            </Descriptions.Item>
          )}

          {hasProp(data?.extra?.properties, "Socket Write Timeout") && (
            <Descriptions.Item label="Socket Write Timeout" span={3}>
              <Textarea
                style={{ height: "3rem" }}
                disabled={!isUpdatable}
                value={values["Socket Write Timeout"]}
                onChange={({ target }) =>
                  setFieldValue("Socket Write Timeout", target.value)
                }
              />
            </Descriptions.Item>
          )}

          <Descriptions.Item label="Comentários" span={3}>
            <Textarea
              style={{ height: "3rem" }}
              disabled={!isUpdatable}
              value={values["comments"]}
              onChange={({ target }) => setFieldValue("comments", target.value)}
            />
          </Descriptions.Item>
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
  );
}
