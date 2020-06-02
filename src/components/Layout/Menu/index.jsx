import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import Icon from '@components/Icon';
import { Wrapper as Navigator } from './Menu.style';

export default function Menu({ defaultSelectedKeys, navigation }) {
  const location = useLocation();

  return (
    <Navigator
      mode="inline"
      defaultSelectedKeys={[defaultSelectedKeys ? defaultSelectedKeys : location.pathname]}
    >
      {navigation.map(({ text, key, icon, id }) => (
        <Navigator.Item key={key}>
          <Link className="nav-text" id={id} to={key} target="_blank">
            {icon && <Icon type={icon} style={{ fontSize: 14 }} />}
            <span>{text}</span>
          </Link>
        </Navigator.Item>
      ))}
    </Navigator>
  );
}
