import 'styled-components/macro';
import React, { useState } from 'react';

import appInfo from '@utils/appInfo';
import Avatar from '@components/Avatar';
import Drawer from '@components/Drawer';

import Help from '@components/Help';

import Box from './Box';
import Menu from './Menu';
import { Wrapper as Main, Brand, LogOut, UserName } from './Layout.style';
import { useTranslation } from 'react-i18next';

const siderWidth = 250;
const { Sider, Header, Content, Footer } = Main;

const octadesk = window.octadesk;

const setTitle = ({ user }) => {
  document.title = process.env.REACT_APP_SITE_TITLE + ' - ' + user.account.schema;
  appInfo.apiKey = user.account.apiKey;
  if (octadesk && octadesk.chat) {
    octadesk.chat.login({
      name: user.account.userName,
      email: user.account.email
    });
  };
  return user.account.userName;
};

const Me = ({ user, toggleDrawer, t }) => (
  <div
    css="
      align-items: center;
      display: flex;
    "
  >
    <Avatar size={44} icon="user" css="margin-right: 12px !important;" />
    <UserName>{setTitle({ user })}</UserName>
    <LogOut onClick={e => octadesk.chat.toggle()} id="gtm-lnk-ajuda" style={{ marginRight: '12px' }}>
      {t('layout.help')}
    </LogOut>
    <LogOut onClick={e => octadesk.chat.hideApp()} href="/logout" id="gtm-lnk-sair">
      {t('layout.logout')}
    </LogOut>
  </div>
);

export default function Layout({ children, theme, app, setAppSider, ...props }) {
  const [sider, setSider] = useState({
    collapsed: app.sider.collapsed,
    collapsedWidth: 80
  });
  const [isDrawerVisible, setDrawerVisibility] = useState(false);

  const onBreakpoint = breaked => {
    setSider(prevState => ({
      ...prevState,
      collapsedWidth: breaked ? 0 : 80
    }));
  };

  const onCollapse = (collapsed, type) => {
    setSider(prevState => {
      const isCollapsed = type === 'clickTrigger' ? !prevState.collapsed : prevState.collapsed;

      setAppSider({
        collapsed: isCollapsed
      });

      return {
        ...prevState,
        collapsed: isCollapsed
      };
    });
  };

  const toggleDrawer = () => {
    setDrawerVisibility(!isDrawerVisible);
  };

  const { t } = useTranslation();

  return (
    <Main style={{ minHeight: '100vh' }}>
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
          <Brand className="brand" title="noHarm.ai | Cuidando dos pacientes (Outubro Rosa)"/>
        </div>
        <Menu {...props} />
      </Sider>
      <Main style={{ paddingLeft: sider.collapsed ? sider.collapsedWidth : siderWidth }}>
        <Header>
          <Me {...props} toggleDrawer={toggleDrawer} t={t} />
        </Header>
        <Content css="padding: 25px 18px;">
          {theme === 'boxed' ? <Box {...props}>{children}</Box> : children}
        </Content>
        <Footer>
          {appInfo.copyright} &nbsp;
          <a href={process.env.REACT_APP_UPDOWN_LINK} target="_blank" rel="noopener noreferrer">
            <img src="/updown.png" width="12px" alt="updown logo" />
          </a>
        </Footer>
        <Drawer
          width={640}
          placement="right"
          closable={false}
          onClose={toggleDrawer}
          visible={isDrawerVisible}
        >
          <Help />
        </Drawer>
      </Main>
    </Main>
  );
}
