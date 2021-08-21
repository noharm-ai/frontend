import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import Icon from '@components/Icon';
import Badge from '@components/Badge';
import Menu from '@components/Menu';
import Dropdown from '@components/Dropdown';
import Tooltip from '@components/Tooltip';
import Button from '@components/Button';
import Tag from '@components/Tag';
import { sourceToStoreType } from '@utils/transformers/prescriptions';
import { useOutsideAlerter } from '@lib/hooks';

const PanelAction = ({ id, header, source, groupData, checkScreening, isChecking }) => {
  const [isMenuVisible, setMenuVisibility] = useState(false);
  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef, () => {
    setMenuVisibility(false);
  });
  const { t } = useTranslation();
  if (isChecking) {
    console.log('isChecking', isChecking);
  }

  const summarySourceToType = s => {
    switch (sourceToStoreType(s)) {
      case 'prescription':
        return 'drugs';

      case 'solution':
        return 'solutions';
      case 'procedure':
        return 'procedures';

      case 'diet':
        return 'diet';

      default:
        console.error('invalid source', s);
        return null;
    }
  };

  const infoIcon = title => {
    return (
      <Tooltip title={title}>
        <Icon
          type="check"
          style={{
            fontSize: 18,
            color: '#52c41a',
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            right: groupData ? '15px' : '60px'
          }}
        />
      </Tooltip>
    );
  };

  const summaryTags = summary => {
    const tags = [];

    if (summary.alerts) {
      tags.push(
        <Tooltip
          title={
            summary.alergy
              ? t('prescriptionDrugTags.alertsAllergy')
              : t('prescriptionDrugTags.alerts')
          }
          key="alerts"
        >
          <Badge dot count={summary.alergy}>
            <Tag color="red" key="alerts" className="tag-badge">
              {summary.alerts}
            </Tag>
          </Badge>
        </Tooltip>
      );
    }

    if (summary.interventions) {
      tags.push(
        <Tooltip title={t('prescriptionDrugTags.intervention')} key="interventions">
          <Icon
            type="warning"
            style={{ fontSize: 18, color: '#fa8c16', verticalAlign: 'middle', marginRight: '7px' }}
          />
        </Tooltip>
      );
    }

    if (!tags.length) {
      return null;
    }

    return tags.map(t => t);
  };

  const handleMenuClick = ({ key, domEvent }) => {
    switch (key) {
      case 'check':
        checkScreening(id, 's');
        break;

      case 'undo':
        checkScreening(id, '0');
        break;

      default:
        console.error('event not defined');
    }

    domEvent.stopPropagation();
  };

  const prescriptionOptions = header => {
    return (
      <Menu onClick={handleMenuClick}>
        <Menu.Item className="gtm-btn-more-open">
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`/prescricao/${id}`}
            style={{ textDecoration: 'none' }}
          >
            <Icon type="link" style={{ marginRight: '3px' }} /> {t('labels.openPrescription')}
          </a>
        </Menu.Item>
        <Menu.Divider />
        {header.status !== 's' && (
          <Menu.Item key="check" className="gtm-btn-more-check">
            <Icon type="check" />
            {t('labels.checkPrescription')}
          </Menu.Item>
        )}
        {header.status === 's' && (
          <Menu.Item key="undo" className="gtm-btn-more-undo">
            <Icon type="rollback" />
            {t('labels.undoCheckPrescription')}
          </Menu.Item>
        )}
      </Menu>
    );
  };

  const openMenu = e => {
    setMenuVisibility(true);
    e.stopPropagation();
  };

  if (groupData) {
    if (groupData.checked) {
      return infoIcon('Todas as prescrições desta vigência já foram checadas');
    }

    return summaryTags(groupData.summary);
  }

  return (
    <>
      <div className="info">
        {header.status !== 's' && summaryTags(header[summarySourceToType(source)] || {})}
        {header.status === 's' && infoIcon(`${t('labels.checkedBy')}: ${header.user}`)}
      </div>

      <div ref={wrapperRef}>
        <Dropdown overlay={prescriptionOptions(header)} visible={isMenuVisible} trigger={[]}>
          <Tooltip title="Opções">
            <Button
              type="link gtm-bt-check-single"
              onClick={openMenu}
              style={{ padding: 0 }}
              loading={isChecking}
            >
              {!isChecking && <Icon type="more" style={{ marginLeft: 0, fontSize: '30px' }} />}
            </Button>
          </Tooltip>
        </Dropdown>
      </div>
    </>
  );
};

export default PanelAction;
