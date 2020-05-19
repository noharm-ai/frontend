import 'styled-components/macro';
import React, { useState } from 'react';

import appInfo from '@utils/appInfo';
import Avatar from '@components/Avatar';

import Box from './Box';
import Menu from './Menu';
import { Wrapper as Main, Brand, LogOut, UserName } from './Layout.style';

const siderWidth = 250;
const { Sider, Header, Content, Footer } = Main;

const setTitle = ({ user }) => {
  document.title = process.env.REACT_APP_SITE_TITLE + ' - ' + user.account.schema;
  return user.account.userName;
};

const Me = ({ user, doLogout }) => (
  <div
    css="
      align-items: center;
      display: flex;
    "
  >
    <Avatar size={44} icon="user" css="margin-right: 12px !important;" />
    <UserName>{setTitle({ user })}</UserName>
    <LogOut onClick={e => doLogout(e)} id="gtm-lnk-sair">
      Sair
    </LogOut>
  </div>
);

export default function Layout({ children, theme, app, setAppSider, ...props }) {
  const [sider, setSider] = useState({
    collapsed: app.sider.collapsed,
    collapsedWidth: 80
  });

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
          <Brand className="brand" />
        </div>
        <Menu {...props} />
      </Sider>
      <Main style={{ paddingLeft: sider.collapsed ? sider.collapsedWidth : siderWidth }}>
        <Header>
          <Me {...props} />
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
      </Main>
    </Main>
  );
}
