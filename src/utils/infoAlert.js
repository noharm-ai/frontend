import React from 'react';
import styled from 'styled-components/macro';
import moment from 'moment';

import api from '@services/api';
import { INFO_ALERT_MEMORY_TYPE } from '@utils/memory';

import Icon from '@components/Icon';
import Tooltip from '@components/Tooltip';

const MessageLink = styled.a`
  color: rgba(0, 0, 0, 0.85);
  text-decoration: none;
  transition: color 0.3s;

  &:hover {
    color: rgba(0, 0, 0, 0.65);
  }
`;

const alerts = [
  {
    id: '0',
    startDate: moment(new Date(2021, 8, 22, 0, 0, 0)),
    endDate: moment(new Date(2021, 9, 10, 23, 59, 59)),
    message: close => (
      <Tooltip title="Participe da Pesquisa de Satisfação e concorra a uma camiseta da NoHarm!">
        <MessageLink
          href="https://forms.gle/BHSnKadd14izNB768"
          className="gtm-lnk-satisfaction-survey"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => close()}
        >
          Pesquisa de satisfação <Icon type="gift" />
        </MessageLink>
      </Tooltip>
    )
  }
];

const infoAlert = alerts => {
  const alert = alerts.find(a => {
    return a.startDate.isBefore(moment()) && a.endDate.isAfter(moment());
  });
  const hasAlert = async (access_token, userId) => {
    if (alert == null) {
      return false;
    }

    const { data } = await api.getMemory(
      access_token,
      `${INFO_ALERT_MEMORY_TYPE}-${alert.id}-${userId}`
    );

    if (data.data.length > 0) {
      return false;
    }

    return true;
  };

  const getAlert = () => alert;

  const gotIt = (access_token, userId) => {
    api.putMemory(access_token, {
      type: `${INFO_ALERT_MEMORY_TYPE}-${alert.id}-${userId}`,
      value: true
    });
  };

  return {
    getAlert,
    hasAlert,
    gotIt
  };
};

export default infoAlert(alerts);
