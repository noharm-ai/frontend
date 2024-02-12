import "styled-components/macro";
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { UserOutlined } from "@ant-design/icons";
import { ErrorBoundary } from "react-error-boundary";
import { Alert, Drawer } from "antd";
import { useTranslation } from "react-i18next";

import appInfo from "utils/appInfo";
import Avatar from "components/Avatar";
import Button from "components/Button";
import toast from "components/notification";
import security from "services/security";
import Tag from "components/Tag";
import Tooltip from "components/Tooltip";
import IntegrationStatusTag from "components/IntegrationStatusTag";
import { setSupportOpen } from "features/support/SupportSlice";
import SupportForm from "features/support/SupportForm/SupportForm";

import Box from "./Box";
import Menu from "./Menu";
import InfoAlert from "./InfoAlert";
import SearchPrescription from "./SearchPrescription";
import { Wrapper as Main, Brand, LogOut, UserName } from "./Layout.style";
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
  const sec = security(user.account.roles);

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
    const redirect = !sec.isAdmin() && !sec.isSupport() && !sec.isTraining();

    doLogout();
    if (logoutUrl && redirect) {
      setTimeout(() => {
        window.location.href = logoutUrl;
      }, 100);
    }
  };

  return (
    <div
      css="
      align-items: center;
      display: flex;
      width: 100%;
      justify-content: space-between;
    "
    >
      <div css="display: flex; align-items: center; flex: 1">
        {location.pathname !== "/sumario-alta" && (
          <SearchPrescription type={sec.isDoctor() ? "summary" : "default"} />
        )}

        {showAlert && (
          <InfoAlert
            userId={user.account.userId}
            notification={notification}
            setNotification={setNotification}
          />
        )}
      </div>

      <div className="controls">
        <Avatar
          size={44}
          icon={<UserOutlined />}
          css="margin-right: 12px !important;"
        />

        <UserName>
          <div className="name">{setTitle({ user })}</div>
          {sec.isMultiSchema() && (
            <div className="schema">
              <Tag color="#a991d6">{localStorage.getItem("schema")}</Tag>
              <Tooltip title="Posição atual da implantação. Clique para ver mais detalhes">
                <IntegrationStatusTag
                  type={"filled"}
                  style={{ cursor: "pointer" }}
                  status={integrationStatus}
                  onClick={
                    sec.isAdmin() || sec.isTraining()
                      ? () => navigate("/admin/integracao/status")
                      : null
                  }
                />
              </Tooltip>
            </div>
          )}
        </UserName>

        <LogOut
          onClick={openHelp}
          id="gtm-lnk-ajuda"
          style={{ marginRight: "12px" }}
        >
          {t("layout.help")}
        </LogOut>
        <LogOut onClick={(e) => logout()} id="gtm-lnk-sair">
          {t("layout.logout")}
        </LogOut>
      </div>
    </div>
  );
};

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  console.error(error);
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
        <Footer>
          {appInfo.copyright} &nbsp;
          <a
            href={process.env.REACT_APP_UPDOWN_LINK}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="/updown.png" width="12px" alt="updown logo" />
          </a>
        </Footer>
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
              Ver Meus Tickets
            </Button>
          }
        >
          <SupportForm />
        </Drawer>
      </Main>
    </Main>
  );
}
