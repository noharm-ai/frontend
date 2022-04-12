import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Icon from '@components/Icon';
import { Wrapper as Navigator } from './Menu.style';
import './Menu.css';

export default function Menu({ defaultSelectedKeys, navigation, security, featureService }) {
  const location = useLocation();

  const { t } = useTranslation();

  const ItemTitle = ({ icon, text }) => (
    <>
      {icon && <Icon type={icon} style={{ fontSize: 14 }} />}
      <span>{text}</span>
    </>
  );

  const renderItem = ({ text, key, icon, id, role, feature }, t) => {
    if (role && !security.hasRole(role)) {
      return;
    }

    if (feature && !featureService.hasFeature(feature)) {
      return;
    }

    return (
      <Navigator.Item key={key}>
        <Link className="nav-text" id={id} to={key} target="_blank">
          <ItemTitle icon={icon} text={t(text)} />
        </Link>
      </Navigator.Item>
    );
  };

  const renderMenu = (navigation, t) => {
    return navigation.map(item => {
      if (item.children) {
        return (
          <Navigator.SubMenu
            key={item.key}
            title={<ItemTitle icon={item.icon} text={t(item.text)} />}
          >
            {item.children.map(item => renderItem(item, t))}
          </Navigator.SubMenu>
        );
      }

      return renderItem(item, t);
    });
  };

  return (
    <Navigator mode="inline" defaultSelectedKeys={[defaultSelectedKeys || location.pathname]}>
      {renderMenu(navigation, t)}
    </Navigator>
  );
}
