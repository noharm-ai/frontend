import { Drawer, Avatar } from "antd";
import { useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "src/store";
import Button from "components/Button";
import SupportForm from "features/support/SupportForm/SupportForm";
import { SupportFormAI } from "src/features/support/SupportFormAI/SupportFormAI";
import { FeatureService } from "src/services/FeatureService";
import PermissionService from "src/services/PermissionService";
import Feature from "src/models/Feature";
import { setSupportOpen } from "features/support/SupportSlice";
import Permission from "src/models/Permission";

import { ChatHeader } from "src/features/support/SupportFormAI/SupportFormAI.style";
import { SupportInfo } from "./SupportInfo/SupportInfo";

export function SupportDrawer() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const supportDrawerOpen = useAppSelector((state) => state.support.open);

  return (
    <Drawer
      open={supportDrawerOpen}
      size="large"
      onClose={() => dispatch(setSupportOpen(false))}
      mask={false}
      title={
        <ChatHeader>
          <Avatar
            size={60}
            src="/imgs/n0-pharma.png"
            style={{
              flexShrink: 0,
              border: "2px solid #FF8845",
            }}
          />
          <h2>Suporte NoHarm</h2>
        </ChatHeader>
      }
      extra={
        <Button
          onClick={() => {
            dispatch(setSupportOpen(false));
            navigate("/suporte");
          }}
        >
          Abrir Central de Ajuda
        </Button>
      }
    >
      {PermissionService().has(Permission.WRITE_SUPPORT) ? (
        <>
          {FeatureService.has(Feature.N0_AGENT) ? (
            <SupportFormAI mode="default" />
          ) : (
            <SupportForm />
          )}
        </>
      ) : (
        <SupportInfo />
      )}
    </Drawer>
  );
}
