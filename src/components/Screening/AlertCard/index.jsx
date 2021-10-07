import React from 'react';
import { useTranslation } from 'react-i18next';

import Icon from '@components/Icon';
import PrescriptionCard from '@components/PrescriptionCard';
import Tooltip from '@components/Tooltip';

import { AlertContainer } from './index.style';

export default function AlertCard({ stats }) {
  const { t } = useTranslation();

  if (!stats) {
    return null;
  }

  const alerts = [
    {
      label: t('alerts.y'),
      icon: 'fork',
      value: stats.inc
    },
    {
      label: t('alerts.interaction'),
      icon: 'interactionAlert',
      value: stats.int
    },
    {
      label: t('alerts.max_dose'),
      icon: 'maxDose',
      value: stats.maxDose
    },
    {
      label: t('alerts.exam'),
      icon: 'experiment',
      value: stats.exams
    },
    {
      label: t('alerts.time'),
      icon: 'hourglass',
      value: stats.maxTime
    },
    {
      label: t('alerts.elderly'),
      icon: 'elderly',
      value: stats.elderly
    },
    {
      label: t('alerts.alergy'),
      icon: 'allergy',
      value: stats.allergy
    },
    {
      label: t('alerts.tube'),
      icon: 'tube',
      value: stats.tube
    },
    {
      label: t('alerts.duplicate'),
      icon: 'duplicity',
      value: stats.dup
    }
  ];

  return (
    <PrescriptionCard>
      <div className="header">
        <h3 className="title">{t('tableHeader.alerts')}</h3>
      </div>
      <div className="content">
        <AlertContainer>
          {alerts.map(a => (
            <Tooltip title={a.label} key={a.label}>
              <div className={a.value > 0 ? 'alert' : ''}>
                <Icon type={a.icon} /> {a.value}
              </div>
            </Tooltip>
          ))}
        </AlertContainer>
      </div>
    </PrescriptionCard>
  );
}
