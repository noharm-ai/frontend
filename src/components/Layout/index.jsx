import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  UserOutlined,
  DownOutlined,
  CustomerServiceOutlined,
  LogoutOutlined,
  CheckOutlined,
  SettingOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import { ErrorBoundary } from "react-error-boundary";
import { Alert, Dropdown, List } from "antd";
import { useTranslation } from "react-i18next";

import appInfo from "utils/appInfo";
import Avatar from "components/Avatar";
import Button from "components/Button";
import toast from "components/notification";
import Tag from "components/Tag";
import Tooltip from "components/Tooltip";
import DefaultModal from "components/Modal";
import IntegrationStatusTag from "components/IntegrationStatusTag";
import { setSupportOpen } from "features/support/SupportSlice";

import PermissionService from "services/PermissionService";
import Permission from "models/Permission";
import { setPendingTickets } from "features/support/SupportSlice";

import Box from "./Box";
import Menu from "./Menu";
import InfoAlert from "./InfoAlert";
import SearchPrescription from "./SearchPrescription";
import {
  Wrapper as Main,
  Brand,
  UserName,
  UserDataContainer,
  HeaderContainer,
} from "./Layout.style";
import "styles/base.css";

const siderWidth = 250;
const { Sider, Header, Content, Footer } = Main;

const setTitle = ({ user }) => {
  document.title = `${import.meta.env.VITE_APP_SITE_TITLE} - ${
    user.account.schema
  }`;

  return user.account.userName;
};

const Me = ({
  user,
  t,
  notification,
  setNotification,
  doLogout,
  logoutUrl,
  integrationStatus,
}) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const showAlert = location.pathname.indexOf("priorizacao") !== -1;

  const openHelp = () => {
    dispatch(setSupportOpen(true));
  };

  const logout = async () => {
    toast.success({
      message: "Obrigado por usar a NoHarm!",
      description: "Até breve ;)",
    });
    document.title = `${import.meta.env.VITE_APP_SITE_TITLE}`;

    await doLogout();
    if (logoutUrl) {
      window.location.href = logoutUrl;
    }
  };

  const userOptions = () => {
    const options = [
      {
        label: t("layout.help"),
        key: "help",
        icon: <CustomerServiceOutlined />,
      },
    ];

    options.push({
      label: t("menu.config"),
      key: "userConfig",
      icon: <SettingOutlined />,
    });

    if (PermissionService().has(Permission.MAINTAINER)) {
      options.push({
        label: "Status da integração",
        key: "status",
        icon: <CheckOutlined />,
      });

      options.push({
        label: "Trocar schema",
        key: "switchSchema",
        icon: <SwapOutlined />,
      });
    }

    return [
      ...options,
      {
        type: "divider",
      },
      {
        label: t("layout.logout"),
        key: "exit",
        icon: <LogoutOutlined />,
        danger: true,
      },
    ];
  };

  const onClickUserOptions = ({ key }) => {
    switch (key) {
      case "help":
        openHelp();
        break;
      case "exit":
        logout();
        break;
      case "status":
        navigate("/admin/integracao/status");
        break;
      case "userConfig":
        navigate("/configuracoes/usuario");
        break;
      case "switchSchema":
        navigate("/switch-schema?alert=true");
        break;
      default:
        break;
    }
  };

  return (
    <HeaderContainer>
      <div className="header-controls">
        <SearchPrescription
          type={location.pathname.includes("sumario") ? "summary" : "default"}
        />

        {showAlert && (
          <InfoAlert
            userId={user.account.userId}
            notification={notification}
            setNotification={setNotification}
          />
        )}
      </div>

      <Tooltip title="Clique para abrir o menu" placement="left">
        <div>
          <Dropdown
            menu={{
              items: userOptions(),
              onClick: onClickUserOptions,
            }}
            trigger={["click"]}
          >
            <UserDataContainer>
              <Avatar
                size={44}
                icon={<UserOutlined />}
                className="user-avatar"
              />

              <UserName>
                <div className="name">{setTitle({ user })}</div>
                {PermissionService().has(Permission.MULTI_SCHEMA) && (
                  <div className="schema">
                    <Tag color="#a991d6">{localStorage.getItem("schema")}</Tag>
                    {PermissionService().has(Permission.MAINTAINER) && (
                      <IntegrationStatusTag
                        type={"filled"}
                        style={{ cursor: "pointer" }}
                        status={integrationStatus}
                      />
                    )}
                  </div>
                )}
              </UserName>

              <DownOutlined />
            </UserDataContainer>
          </Dropdown>
        </div>
      </Tooltip>
    </HeaderContainer>
  );
};

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  console.error(error);
  if (window.cwr) {
    const ignore =
      error &&
      error.message &&
      /^Request failed with status code 401/.test(error.message);

    if (!ignore) {
      window.cwr("recordError", error);
    }
  }
  return (
    <div style={{ maxWidth: "500px" }}>
      <Alert
        message="Ocorreu um erro"
        showIcon
        description="Por favor, tente novamente. Se o erro persistir, entre em contato com o suporte."
        type="error"
        action={
          <Button size="small" onClick={resetErrorBoundary}>
            Tentar novamente
          </Button>
        }
      />
    </div>
  );
};

export default function Layout({
  children,
  theme,
  app,
  setAppSider,
  segments,
  ...props
}) {
  const dispatch = useDispatch();
  const supportPendingTickets = useSelector(
    (state) => state.support.pendingTickets.list
  );
  const [sider, setSider] = useState({
    collapsed: app.sider.collapsed,
    collapsedWidth: 80,
  });

  useEffect(() => {
    const openTicket = (record) => {
      const link = `${import.meta.env.VITE_APP_ODOO_LINK}my/ticket/${
        record.id
      }?access_token=${record.access_token}`;
      window.open(link, "_blank");
    };

    if (supportPendingTickets.length > 0) {
      DefaultModal.warning({
        title: "Chamados Aguardando Resposta",
        content: (
          <>
            <p>
              Você possui {supportPendingTickets.length} chamado(s) que aguardam
              sua resposta para que possamos dar continuidade.
            </p>

            <p>
              Entendemos que pode ser uma interrupção, mas sua colaboração é
              essencial para resolvermos a sua solicitação o mais rápido
              possível.
            </p>

            <List
              loading={false}
              itemLayout="horizontal"
              dataSource={supportPendingTickets}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Tooltip title="Abrir chamado">
                      <Button type="primary" onClick={() => openTicket(item)}>
                        Abrir
                      </Button>
                    </Tooltip>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<CustomerServiceOutlined />}
                    title={item.name}
                    description="Aguardando resposta"
                  />
                </List.Item>
              )}
            />
          </>
        ),
        width: 500,
        okText: "Fechar",
        okButtonProps: { type: "default" },
        wrapClassName: "default-modal",
        onOk: () => dispatch(setPendingTickets([])),
      });
    }
  }, [supportPendingTickets, dispatch]);

  const onBreakpoint = (breaked) => {
    setSider((prevState) => ({
      ...prevState,
      collapsedWidth: breaked ? 0 : 80,
    }));
  };

  const onCollapse = (collapsed, type) => {
    setSider((prevState) => {
      const isCollapsed =
        type === "clickTrigger" ? !prevState.collapsed : prevState.collapsed;

      return {
        ...prevState,
        collapsed: isCollapsed,
      };
    });

    if (type === "clickTrigger") {
      setAppSider({
        collapsed,
      });
    }
  };

  const { t } = useTranslation();

  return (
    <Main style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        breakpoint="lg"
        width={siderWidth}
        onCollapse={onCollapse}
        onBreakpoint={onBreakpoint}
        collapsed={sider.collapsed}
        collapsedWidth={sider.collapsedWidth}
      >
        <div css="padding: 0 15px 30px;">
          <Brand className="brand" title="noHarm.ai | Cuidando dos pacientes" />
        </div>
        <Menu segments={segments} />
      </Sider>
      <Main
        style={{
          paddingLeft: window.nh_compatibility
            ? 0
            : sider.collapsed
            ? sider.collapsedWidth
            : siderWidth,
        }}
      >
        <Header>
          <Me
            {...props}
            t={t}
            notification={app.notification}
            integrationStatus={app.config.integrationStatus}
          />
        </Header>
        <Content css="padding: 25px 18px;">
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            {theme === "boxed" ? <Box {...props}>{children}</Box> : children}
          </ErrorBoundary>
        </Content>
        <Footer>{appInfo.copyright}</Footer>
      </Main>
    </Main>
  );
}
