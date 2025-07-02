import { useTranslation } from "react-i18next";
import { Tabs, Popconfirm } from "antd";
import {
  DeleteOutlined,
  SearchOutlined,
  SaveOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { Formik } from "formik";
import { isEmpty } from "lodash";

import { useAppDispatch, useAppSelector } from "src/store";
import DefaultModal from "components/Modal";
import notification from "components/notification";
import Button from "components/Button";
import { getErrorMessage } from "utils/errorHandler";
import {
  setSelectedNode,
  setQueueDrawer,
  pushQueueRequest,
} from "../IntegrationRemoteSlice";
import { BulletinTab } from "./BulletinTab";
import { DiagnosticTab } from "./DiagnosticTab";
import { PropertiesTab } from "./PropertiesTab";
import { MainTab } from "./MainTab";

export interface INodeData {
  name: string;
  status: any;
  extra: any;
}

export function NodeModal() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const data: INodeData = useAppSelector(
    (state) => state.admin.integrationRemote.selectedNode!
  );
  const controllers = useAppSelector(
    (state) => state.admin.integrationRemote.template.controllers
  );
  const activeAction = useAppSelector(
    (state) => state.admin.integrationRemote.pushQueueRequest.activeAction
  );

  const isUpdatable =
    ["Stopped", "Invalid", "Disabled"].indexOf(data?.status?.runStatus) !== -1;

  const executeAction = (actionType: string, params = {}) => {
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
    // @ts-expect-error ts 2554 (legacy code)
    dispatch(pushQueueRequest(payload)).then((response: any) => {
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

  const initialValues = {
    ...data?.extra?.properties,
    schedulingPeriod: data?.extra?.schedulingPeriod,
    comments: data?.extra?.comments,
    name: data?.extra?.name,
  };

  const footerActions = (handleSubmit: (params: any) => void) => {
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

  const updatableProperties = [
    { key: "Maximum-value Columns", label: "Maximum-value Columns" },
    { key: "Max Wait Time", label: "Max Wait Time" },
    { key: "qdbt-max-rows", label: "Max Rows Per Flow File (qdbt-max-rows)" },
    { key: "Remote URL", label: "Remote URL" },
    { key: "SQL select query", label: "SQL select query" },
    { key: "sql-post-query", label: "SQL post-query" },
    { key: "sql-pre-query", label: "SQL pre-query" },
    { key: "db-fetch-sql-query", label: "Custom query (db-fetch-sql-query)" },
    {
      key: "db-fetch-where-clause",
      label: "Additional WHERE clause (db-fetch-where-clause)",
    },
    { key: "Table Name", label: "Table Name" },
    {
      key: "put-db-record-statement-type",
      label: "Statement type (put-db-record-statement-type)",
    },
    {
      key: "put-db-record-update-keys",
      label: "Update keys (put-db-record-update-keys)",
    },
    {
      key: "put-db-record-table-name",
      label: "Table name (put-db-record-table-name)",
    },
    {
      key: "put-db-record-query-timeout",
      label: "Max Wait Time (put-db-record-query-timeout)",
    },
    {
      key: "generate-ff-custom-text",
      label: "Custom text (generate-ff-custom-text)",
    },
    { key: "Columns to Return", label: "Columns to Return" },
    { key: "Connection Timeout", label: "Connection Timeout" },
    { key: "Read Timeout", label: "Read Timeout" },
    { key: "Socket Write Timeout", label: "Socket Write Timeout" },
    { key: "Command Arguments", label: "Command Arguments" },
  ];

  const updatableConfigs = [
    { key: "name", label: "Nome" },
    { key: "schedulingPeriod", label: "Agendamento" },
    { key: "comments", label: "Comentários" },
  ];

  if (
    data?.extra?.type === "org.apache.nifi.processors.standard.RouteOnAttribute"
  ) {
    Object.keys(data?.extra?.properties).forEach((prop: any) => {
      updatableProperties.push({
        key: prop,
        label: prop,
      });
    });
  }

  const getItems = (
    setFieldValue: (key: string, value: any) => void,
    values: any
  ) => [
    {
      key: "0",
      label: "Principal",
      children: (
        <MainTab
          data={data}
          setFieldValue={setFieldValue}
          values={values}
          activeAction={activeAction}
          isUpdatable={isUpdatable}
          executeAction={executeAction}
          controllers={controllers}
          updatableProperties={updatableProperties}
          updatableConfigs={updatableConfigs}
        />
      ),
    },
    {
      key: "1",
      label: "Propriedades",
      children: <PropertiesTab data={data} />,
    },
    {
      key: "3",
      label: "Diagnóstico",
      children: <DiagnosticTab data={data} />,
    },
    {
      key: "4",
      label: "Bulletin",
      children: <BulletinTab data={data} />,
    },
  ];

  const onSave = (params: any) => {
    const payload: { properties?: any; config?: any } = {};
    const properties: any = {};
    const config: any = {};

    const validFields = updatableProperties.map(({ key }) => key);

    const validConfigFields = updatableConfigs.map(({ key }) => key);

    validFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(params, field)) {
        properties[field] = params[field] === "" ? null : params[field];
      }
    });

    validConfigFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(params, field)) {
        config[field] = params[field] === "" ? null : params[field];
      }
    });

    if (!isEmpty(properties)) {
      payload["properties"] = properties;
    }

    if (!isEmpty(config)) {
      payload["config"] = config;
    }

    if (!isEmpty(payload)) {
      executeAction("UPDATE_PROPERTY", payload);
    } else {
      console.error("empty payload");
    }
  };

  return (
    <Formik enableReinitialize onSubmit={onSave} initialValues={initialValues}>
      {({ handleSubmit, setFieldValue, values }) => (
        <DefaultModal
          width={"60vw"}
          centered
          destroyOnClose
          open={data ? true : false}
          onCancel={() => dispatch(setSelectedNode(null))}
          footer={footerActions(handleSubmit)}
        >
          <h2 className="modal-title">{data?.name}</h2>

          <Tabs defaultActiveKey="0" items={getItems(setFieldValue, values)} />
        </DefaultModal>
      )}
    </Formik>
  );
}
