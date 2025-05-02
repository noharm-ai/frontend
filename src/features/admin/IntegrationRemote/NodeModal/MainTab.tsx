import { Descriptions, Space, Popconfirm } from "antd";
import { DeleteOutlined, SearchOutlined } from "@ant-design/icons";

import Dropdown from "components/Dropdown";
import { Textarea, Select } from "components/Inputs";
import Button from "components/Button";
import NodeStatusTag from "../components/NodeStatusTag";
import { INodeData } from "./NodeModal";
import { getController } from "../transformer";
import React from "react";

interface IMainTabProps {
  data: INodeData;
  activeAction: string | null;
  isUpdatable: boolean;
  values: any;
  controllers: any[];
  updatableProperties: {
    key: string;
    label: string;
  }[];
  updatableConfigs: {
    key: string;
    label: string;
  }[];
  setFieldValue: (key: string, value: any) => void;
  executeAction: (action: string, payload?: any) => void;
}

export function MainTab({
  data,
  activeAction,
  isUpdatable,
  values,
  controllers,
  updatableProperties,
  updatableConfigs,
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
          {hasProp(
            data?.extra?.properties,
            "Database Connection Pooling Service"
          ) && (
            <Descriptions.Item
              label="Database Connection Pooling Service"
              span={3}
            >
              {getController(
                data?.extra.properties["Database Connection Pooling Service"],
                controllers
              )?.name ??
                data?.extra.properties["Database Connection Pooling Service"]}
            </Descriptions.Item>
          )}
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

          {updatableConfigs
            .filter(
              ({ key }) =>
                (data?.extra && data?.extra[key]) || key === "comments"
            )
            .map(({ key, label }) => (
              <React.Fragment key={key}>
                <Descriptions.Item label={label} span={3}>
                  <Textarea
                    value={values[key]}
                    style={{ height: "3rem" }}
                    disabled={!isUpdatable}
                    onChange={({ target }) => setFieldValue(key, target.value)}
                  />
                </Descriptions.Item>
              </React.Fragment>
            ))}

          {updatableProperties
            .filter(({ key }) => hasProp(data?.extra?.properties, key))
            .map(({ key, label }) => (
              <React.Fragment key={key}>
                {key === "put-db-record-statement-type" ? (
                  <>
                    {hasProp(
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
                  </>
                ) : (
                  <>
                    {hasProp(data?.extra?.properties, key) && (
                      <Descriptions.Item label={label} span={3}>
                        <Textarea
                          value={values[key]}
                          style={{ height: "3rem" }}
                          disabled={!isUpdatable}
                          onChange={({ target }) =>
                            setFieldValue(key, target.value)
                          }
                        />
                      </Descriptions.Item>
                    )}
                  </>
                )}
              </React.Fragment>
            ))}
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
