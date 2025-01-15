import "styled-components/macro";
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  UserOutlined,
  DownloadOutlined,
  DownOutlined,
  CustomerServiceOutlined,
  LogoutOutlined,
  CheckOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { ErrorBoundary } from "react-error-boundary";
import { Alert, Drawer, Dropdown } from "antd";
import { useTranslation } from "react-i18next";

import appInfo from "utils/appInfo";
import Avatar from "components/Avatar";
import Button from "components/Button";
import toast from "components/notification";
import Tag from "components/Tag";
import Tooltip from "components/Tooltip";
import IntegrationStatusTag from "components/IntegrationStatusTag";
import { setSupportOpen } from "features/support/SupportSlice";
import SupportForm from "features/support/SupportForm/SupportForm";
import PermissionService from "services/PermissionService";
import Permission from "models/Permission";
import api from "services/api";

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
  document.title = `${process.env.REACT_APP_SITE_TITLE} - ${user.account.schema}`;
  appInfo.apiKey = user.account.apiKey;

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
  const [refreshPage, setRefreshPage] = useState(false);

  useEffect(() => {
    const checkVersion = () => {
      api.getVersion().then((response) => {
        if (response.data.status === "success") {
          const localVersion = process.env.REACT_APP_VERSION;
          const version = response.data.data;

          if (localVersion < version) {
            setRefreshPage(true);
          }
        }
      });
    };

    const intervalId = setInterval(() => {
      checkVersion();
    }, 60000 * 30);

    return () => {
      clearInterval(intervalId);
    };
  }, []); //eslint-disable-line

  const showAlert = location.pathname.indexOf("priorizacao") !== -1;

  const openHelp = () => {
    dispatch(setSupportOpen(true));
  };

  const logout = () => {
    toast.success({
      message: "Obrigado por usar a NoHarm!",
      description: "Até breve ;)",
    });
    document.title = `${process.env.REACT_APP_SITE_TITLE}`;
    const redirect = !PermissionService().has(Permission.MAINTAINER);

    doLogout();
    if (logoutUrl && redirect) {
      setTimeout(() => {
        window.location.href = logoutUrl;
      }, 100);
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
        {refreshPage && (
          <Tooltip title="Existe uma nova versão da NoHarm. Clique aqui para atualizar. Se a mensagem persistir, limpe o cache do navegador e acesse a NoHarm novamente.">
            <Alert
              style={{ marginLeft: "10px", cursor: "pointer" }}
              message="Atualizar a NoHarm"
              type="info"
              showIcon
              icon={<DownloadOutlined />}
              onClick={() => window.location.reload(true)}
            />
          </Tooltip>
        )}
      </div>

      <Tooltip title="Clique para abrir o menu" placement="left">
        <Dropdown
          menu={{
            items: userOptions(),
            onClick: onClickUserOptions,
          }}
          trigger={["click"]}
        >
          <UserDataContainer>
            <Avatar size={44} icon={<UserOutlined />} className="user-avatar" />

            <UserName>
              <div className="name">{setTitle({ user })}</div>
              {PermissionService().has(Permission.MULTI_SCHEMA) && (
                <div className="schema">
                  <Tag color="#a991d6">{localStorage.getItem("schema")}</Tag>
                  {PermissionService().has(Permission.MAINTAINER) && (
                    <Tooltip title="Posição atual da implantação.">
                      <IntegrationStatusTag
                        type={"filled"}
                        style={{ cursor: "pointer" }}
                        status={integrationStatus}
                      />
                    </Tooltip>
                  )}
                </div>
              )}
            </UserName>

            <DownOutlined />
          </UserDataContainer>
        </Dropdown>
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
  ...props
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const supportDrawerOpen = useSelector((state) => state.support.open);
  const [sider, setSider] = useState({
    collapsed: app.sider.collapsed,
    collapsedWidth: 80,
  });

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
        <Menu {...props} />
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
        <Drawer
          open={supportDrawerOpen}
          size="large"
          onClose={() => dispatch(setSupportOpen(false))}
          mask={false}
          title={t("layout.help")}
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
          <SupportForm />
        </Drawer>
      </Main>
    </Main>
  );
}
