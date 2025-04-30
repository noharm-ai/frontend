import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { FloatButton, Badge } from "antd";
import {
  ArrowLeftOutlined,
  UnorderedListOutlined,
  BugOutlined,
  ReloadOutlined,
  SettingOutlined,
} from "@ant-design/icons";

import Tooltip from "components/Tooltip";
import PopConfirm from "components/PopConfirm";
import {
  setQueueDrawer,
  setBulletinModal,
  setControllersModal,
  pushQueueRequest,
} from "../IntegrationRemoteSlice";

export default function GraphActions({ goBack }) {
  const dispatch = useDispatch();
  const bulletin = useSelector(
    (state) => state.admin.integrationRemote.template.bulletin
  );
  const drawerActive = useSelector(
    (state) => state.admin.integrationRemote.queue.drawer
  );
  const activeAction = useSelector(
    (state) => state.admin.integrationRemote.pushQueueRequest.activeAction
  );

  const refreshTemplate = () => {
    if (activeAction === "REFRESH_TEMPLATE") {
      return;
    }

    const payload = {
      actionType: "REFRESH_TEMPLATE",
    };

    dispatch(pushQueueRequest(payload));
    dispatch(setQueueDrawer(true));
  };

  return (
    <FloatButton.Group
      shape="circle"
      style={{ right: drawerActive ? 405 : 24, transition: "all 0.1s linear" }}
    >
      <Tooltip title="Fila de ações">
        <FloatButton
          icon={<UnorderedListOutlined />}
          onClick={() => dispatch(setQueueDrawer(true))}
        />
      </Tooltip>
      <Tooltip title="Atualizar template">
        <PopConfirm
          title="Atualizar template"
          description="Confirma a atualização do template?"
          okText="Sim"
          cancelText="Não"
          onConfirm={() => refreshTemplate()}
          zIndex={9999}
        >
          <FloatButton icon={<ReloadOutlined />} />
        </PopConfirm>
      </Tooltip>
      <Tooltip title="Controllers">
        <FloatButton
          icon={<SettingOutlined />}
          onClick={() => dispatch(setControllersModal(true))}
          style={{ marginBottom: "15px" }}
        />
      </Tooltip>

      <Tooltip title="Bulletin board">
        <Badge count={(bulletin?.bulletinBoard?.bulletins ?? []).length}>
          <FloatButton
            icon={<BugOutlined />}
            onClick={() => dispatch(setBulletinModal(true))}
            style={{ marginBottom: "15px" }}
          />
        </Badge>
      </Tooltip>

      <Tooltip title="Voltar ao nível anterior">
        <FloatButton icon={<ArrowLeftOutlined />} onClick={() => goBack()} />
      </Tooltip>
    </FloatButton.Group>
  );
}
