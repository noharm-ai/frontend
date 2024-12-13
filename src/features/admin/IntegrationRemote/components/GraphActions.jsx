import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { FloatButton, Badge } from "antd";
import {
  ArrowLeftOutlined,
  UnorderedListOutlined,
  BugOutlined,
} from "@ant-design/icons";

import Tooltip from "components/Tooltip";
import { setQueueDrawer, setBulletinModal } from "../IntegrationRemoteSlice";

export default function GraphActions({ goBack }) {
  const dispatch = useDispatch();
  const bulletin = useSelector(
    (state) => state.admin.integrationRemote.template.bulletin
  );
  const drawerActive = useSelector(
    (state) => state.admin.integrationRemote.queue.drawer
  );

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
