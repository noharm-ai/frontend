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
      "put-db-record-query-timeout",
      "generate-ff-custom-text",
      "Columns to Return",
      "Connection Timeout",
      "Read Timeout",
      "Socket Write Timeout",
    ];

    const validConfigFields = ["schedulingPeriod", "comments"];

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
