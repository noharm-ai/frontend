import React from 'react';

import Alert from '@components/Alert';
import Icon from '@components/Icon';
import Tooltip from '@components/Tooltip';
import api from '@services/api';
import { INFO_ALERT_MEMORY_TYPE } from '@utils/memory';

import { MessageLink } from '../Layout.style';

export default function InfoAlert({ access_token, userId, notification, setNotification }) {
  const onClose = () => {
    api.putMemory(access_token, {
      type: `${INFO_ALERT_MEMORY_TYPE}-${notification.id}-${userId}`,
      value: true
    });
    setNotification(null);
  };

  if (!notification) {
    return null;
  }

  const message = (
    <Tooltip title={notification.tooltip}>
      <MessageLink
        href={notification.link}
        className={notification.classname}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => onClose()}
      >
        {notification.title} <Icon type={notification.icon} />
      </MessageLink>
    </Tooltip>
  );

  return (
    <div style={{ marginLeft: '10px' }}>
      <Alert
        message={message}
        type="info"
        closable
        style={{ paddingRight: '50px' }}
        onClose={onClose}
      />
    </div>
  );
}
