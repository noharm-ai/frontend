import "styled-components/macro";
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { UserOutlined } from "@ant-design/icons";
import { ErrorBoundary } from "react-error-boundary";
import { Alert } from "antd";
import { useTranslation } from "react-i18next";

import appInfo from "utils/appInfo";
import Avatar from "components/Avatar";
import Button from "components/Button";
import toast from "components/notification";
import security from "services/security";

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
  access_token,
  t,
  notification,
  setNotification,
  doLogout,
  logoutUrl,
}) => {
  const location = useLocation();
  const sec = security(user.account.roles);

  const showAlert = location.pathname.indexOf("priorizacao") !== -1;

  const openHelp = () => {
    try {
      window.octadesk.chat.login({
        name: user.account.userName,
        email: user.account.email,
      });
      window.octadesk.chat.toggle();
    } catch (ex) {
      console.error("octadesk error", ex);
      window.open(`mailto:${process.env.REACT_APP_SUPPORT_EMAIL}`);
    }
  };

  const logout = () => {
    try {
      window.octadesk.chat.hideApp();
    } catch (ex) {
      console.error("octadesk error", ex);
    }

    toast.success({
      message: "Obrigado por usar a NoHarm!",
      description: "Até breve ;)",
    });
    doLogout();
    if (logoutUrl) {
      window.location.href = logoutUrl;
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
      <div css="display: flex; align-items: center; width: 50%;">
        {location.pathname !== "/sumario-alta" && (
          <SearchPrescription type={sec.isDoctor() ? "summary" : "default"} />
        )}

        {showAlert && (
          <InfoAlert
            access_token={access_token}
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
        <UserName>{setTitle({ user })}</UserName>

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
  const [sider, setSider] = useState({
    collapsed: app.sider.collapsed,
    collapsedWidth: 80,
  });
  const [isDrawerVisible, setDrawerVisibility] = useState(false);

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

  const toggleDrawer = () => {
    setDrawerVisibility(!isDrawerVisible);
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
          paddingLeft: sider.collapsed ? sider.collapsedWidth : siderWidth,
        }}
      >
        <Header>
          <Me
            {...props}
            toggleDrawer={toggleDrawer}
            t={t}
            notification={app.notification}
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
      </Main>
    </Main>
  );
}
