import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import Icon from '@components/Icon';
import { Wrapper as Navigator } from './Menu.style';
import './Menu.css';

export default function Menu({ defaultSelectedKeys, navigation }) {
  const location = useLocation();

  const ItemTitle = ({ icon, text }) => (
    <>
      {icon && <Icon type={icon} style={{ fontSize: 14 }} />}
      <span>{text}</span>
    </>
  );

  const renderItem = ({ text, key, icon, id }) => (
    <Navigator.Item key={key}>
      <Link className="nav-text" id={id} to={key} target="_blank">
        <ItemTitle icon={icon} text={text} />
      </Link>
    </Navigator.Item>
  );

  const renderMenu = navigation => {
    return navigation.map(item => {
      if (item.children) {
        return (
          <Navigator.SubMenu key={item.key} title={<ItemTitle icon={item.icon} text={item.text} />}>
            {item.children.map(item => renderItem(item))}
          </Navigator.SubMenu>
        );
      }

      return renderItem(item);
    });
  };

  return (
    <Navigator
      mode="inline"
      defaultSelectedKeys={[defaultSelectedKeys ? defaultSelectedKeys : location.pathname]}
    >
      {renderMenu(navigation)}
    </Navigator>
  );
}
