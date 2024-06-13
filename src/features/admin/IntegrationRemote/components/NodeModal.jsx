import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Tabs } from "antd";

import DefaultModal from "components/Modal";
import Heading from "components/Heading";
import Descriptions from "components/Descriptions";
import Button from "components/Button";
import notification from "components/notification";
import { getErrorMessage } from "utils/errorHandler";
import { setProcessorState, setSelectedNode } from "../IntegrationRemoteSlice";

export default function NodeModal() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const data = useSelector(
    (state) => state.admin.integrationRemote.selectedNode
  );

  const executeSetProcessorState = (state) => {
    const payload = {
      idProcessor: data.extra.instanceIdentifier,
      state,
    };
    dispatch(setProcessorState(payload)).then((response) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        notification.success({
          message: t("success.generic"),
        });
      }
    });
  };

  const items = [
    {
      key: "1",
      label: "Geral",
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
        </Descriptions>
      ),
    },
    {
      key: "2",
      label: "Propriedades",
      children: (
        <Descriptions bordered size="small">
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
    {
      key: "4",
      label: "Acões",
      children: (
        <>
          <Button onClick={() => executeSetProcessorState("STOPPED")}>
            STOP
          </Button>
          <Button onClick={() => executeSetProcessorState("RUNNING")}>
            RUN
          </Button>
          <Button onClick={() => executeSetProcessorState("RUN_ONCE")}>
            RUN ONCE
          </Button>
          <Button onClick={() => executeSetProcessorState("DISABLED")}>
            DISABLE
          </Button>
        </>
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
    >
      <Heading margin="0 0 11px" size="18px">
        {data?.name}
      </Heading>

      <Tabs defaultActiveKey="1" items={items} />
    </DefaultModal>
  );
}
