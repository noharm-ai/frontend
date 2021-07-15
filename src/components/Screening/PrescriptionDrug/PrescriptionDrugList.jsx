import React, { useState } from 'react';
import isEmpty from 'lodash.isempty';
import { format, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';

import Icon from '@components/Icon';
import LoadBox from '@components/LoadBox';
import Empty from '@components/Empty';
import Collapse from '@components/Collapse';
import Tooltip from '@components/Tooltip';
import Button from '@components/Button';
import TableFilter from '@components/TableFilter';
import Tag from '@components/Tag';
import Badge from '@components/Badge';
import { sourceToStoreType } from '@utils/transformers/prescriptions';

import FormIntervention from '@containers/Forms/Intervention';
import ModalPrescriptionDrug from '@containers/Screening/ModalPrescriptionDrug';

import { isPendingValidation } from '../columns';
import { GroupPanel, PrescriptionPanel, PrescriptionHeader } from './PrescriptionDrug.style';
import Table from './components/Table';

const isExpired = date => {
  if (parseISO(date).getTime() < Date.now()) {
    return true;
  }

  return false;
};

export const rowClassName = record => {
  const classes = [];

  if (record.total) {
    classes.push('summary-row');
  }

  if (record.dividerRow) {
    classes.push('divider-row');
  }

  if (record.suspended) {
    classes.push('suspended');
  }

  if (record.checked && isEmpty(record.prevIntervention)) {
    classes.push('checked');
  }

  if (record.whiteList && !record.total) {
    classes.push('checked');
  }

  if (record.intervention && record.intervention.status === 's') {
    classes.push('danger');
  }

  return classes.join(' ');
};

export default function PrescriptionDrugList({
  hasFilter,
  listType,
  isFetching,
  dataSource,
  listRaw,
  headers,
  aggregated,
  emptyMessage,
  saveInterventionStatus,
  checkIntervention,
  periodObject,
  fetchPeriod,
  weight,
  admissionNumber,
  checkPrescriptionDrug,
  savePrescriptionDrugStatus,
  idSegment,
  select,
  selectPrescriptionDrug,
  uniqueDrugs
}) {
  const [visible, setVisibility] = useState(false);
  const [openPrescriptionDrugModal, setOpenPrescriptionDrugModal] = useState(false);
  const [filter, setFilter] = useState({
    status: null
  });
  const { t } = useTranslation();

  if (isFetching) {
    return <LoadBox />;
  }

  const handleFilter = (e, status) => {
    if (status) {
      setFilter({ status: status === 'all' ? null : [status] });
    }
  };

  const isFilterActive = status => {
    if (filter.status) {
      return filter.status[0] === status;
    }

    return filter.status == null && status == null;
  };

  const onShowModal = data => {
    select(data);
    setVisibility(true);
  };

  const onShowPrescriptionDrugModal = data => {
    selectPrescriptionDrug(data);
    setOpenPrescriptionDrugModal(true);
  };

  const bag = {
    onShowModal,
    onShowPrescriptionDrugModal,
    check: checkPrescriptionDrug,
    savePrescriptionDrugStatus,
    idSegment,
    admissionNumber,
    saveInterventionStatus,
    checkIntervention,
    periodObject,
    fetchPeriod,
    weight,
    uniqueDrugList: uniqueDrugs,
    t
  };

  const prescriptionCount = {
    all: listRaw ? listRaw.length : 0,
    pendingValidation: listRaw ? listRaw.reduce((n, i) => n + isPendingValidation(i), 0) : 0
  };

  const ListFilter = ({ listCount, handleFilter, isFilterActive }) => (
    <TableFilter style={{ marginBottom: 15 }}>
      <Tooltip title={t('prescriptionDrugList.btnPendingValidationHint')}>
        <Button
          type="gtm-lnk-filter-presc-pendentevalidacao ant-btn-link-hover"
          className={isFilterActive('pending-validation') ? 'active' : ''}
          onClick={e => handleFilter(e, 'pending-validation')}
        >
          {t('prescriptionDrugList.btnPendingValidation')}
          <Tag color="orange">{listCount.pendingValidation}</Tag>
        </Button>
      </Tooltip>
      <Tooltip title={t('prescriptionDrugList.btnAllHint')}>
        <Button
          type="gtm-lnk-filter-presc-todos ant-btn-link-hover"
          className={isFilterActive(null) ? 'active' : ''}
          onClick={e => handleFilter(e, 'all')}
        >
          {t('prescriptionDrugList.btnAll')}
          <Tag>{listCount.all}</Tag>
        </Button>
      </Tooltip>
    </TableFilter>
  );

  const table = ds => (
    <Table
      hasFilter={hasFilter}
      filter={filter}
      bag={bag}
      isFetching={isFetching}
      emptyMessage={emptyMessage}
      ds={ds}
      listType={listType}
    />
  );

  const panelHeader = ds => (
    <PrescriptionHeader className="panel-header">
      <div className="title">
        <strong className="p-number">
          {t('prescriptionDrugList.panelPrescription')} &nbsp;
          <a href={`/prescricao/${ds.key}`} target="_blank" rel="noopener noreferrer">
            # {ds.key}
          </a>
        </strong>
      </div>
      <div className="subtitle">
        <span style={{ paddingLeft: 0 }}>
          <strong>{t('prescriptionDrugList.panelIssueDate')}:</strong> &nbsp;
          {format(new Date(headers[ds.key].date), 'dd/MM/yyyy HH:mm')}
        </span>
        <span>
          <strong>{t('prescriptionDrugList.panelValidUntil')}:</strong> &nbsp;
          <span className={isExpired(headers[ds.key].expire, true) ? 'expired' : ''}>
            {format(new Date(headers[ds.key].expire), 'dd/MM/yyyy HH:mm')}
          </span>
        </span>
        <span>
          <strong>{t('prescriptionDrugList.panelBed')}:</strong> &nbsp;
          {headers[ds.key].bed}
        </span>
        <span>
          <strong>{t('prescriptionDrugList.panelPrescriber')}:</strong> &nbsp;
          {headers[ds.key].prescriber}
        </span>
      </div>
    </PrescriptionHeader>
  );

  const groupHeader = dt => (
    <PrescriptionHeader>
      <span style={{ fontSize: '16px' }}>
        <strong>{t('prescriptionDrugList.panelValidUntil')}:</strong> &nbsp;
        <span className={isExpired(`${dt}T23:59:59`) ? 'expired' : ''}>
          {format(parseISO(dt), 'dd/MM/yyyy')}
        </span>
      </span>
    </PrescriptionHeader>
  );

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
            right: '15px'
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

  const prescriptionSummary = (header, source) => {
    if (header.status === 's') {
      return infoIcon('Prescrição checada');
    }

    return summaryTags(header[summarySourceToType(source)] || {});
  };

  const groupSummary = groupData => {
    if (groupData.checked) {
      return infoIcon('Todas as prescrições desta vigência já foram checadas');
    }

    return summaryTags(groupData.summary);
  };

  const list = group => {
    const msg = 'Nenhuma prescrição encontrada.';

    if (isEmpty(dataSource)) {
      return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={msg} />;
    }
    let hasPrescription = false;
    dataSource.forEach(ds => {
      if (group.indexOf(`${ds.key}`) !== -1) {
        hasPrescription = true;
      }
    });

    if (!hasPrescription) {
      return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={msg} />;
    }

    return dataSource.map((ds, index) => (
      <div key={index}>
        {group.indexOf(`${ds.key}`) !== -1 && (
          <Collapse bordered defaultActiveKey={headers[ds.key].status === 's' ? [] : ['1']}>
            <PrescriptionPanel
              header={panelHeader(ds)}
              key="1"
              className={headers[ds.key].status === 's' ? 'checked' : ''}
              extra={prescriptionSummary(
                headers[ds.key],
                isEmpty(ds.value) ? null : ds.value[0].source
              )}
            >
              {table(ds)}
            </PrescriptionPanel>
          </Collapse>
        )}
      </div>
    ));
  };

  if (!aggregated) {
    return (
      <>
        {table(!isEmpty(dataSource) ? dataSource[0] : [])}
        <FormIntervention
          visible={visible}
          setVisibility={setVisibility}
          checkPrescriptionDrug={checkPrescriptionDrug}
        />
        <ModalPrescriptionDrug
          visible={openPrescriptionDrugModal}
          setVisibility={setOpenPrescriptionDrugModal}
        />
      </>
    );
  }

  const aggSummary = (currentData, addData) => {
    const baseData = currentData || {
      alerts: 0,
      alergy: 0,
      interventions: 0,
      np: 0,
      am: 0,
      av: 0,
      controlled: 0
    };

    if (isEmpty(addData)) {
      return baseData;
    }

    const aggData = {};
    Object.keys(baseData).forEach(k => {
      aggData[k] = baseData[k] + addData[k];
    });

    return aggData;
  };

  const groups = {};
  Object.keys(headers).forEach(k => {
    const dt = headers[k].expire.substr(0, 10);

    if (groups[dt]) {
      groups[dt].ids.push(k);
      groups[dt].summary = aggSummary(
        groups[dt].summary,
        headers[k][summarySourceToType(listType)]
      );
      if (headers[k].status !== 's') {
        groups[dt].checked = false;
      }
    } else {
      groups[dt] = {
        checked: headers[k].status === 's',
        ids: [k],
        summary: aggSummary(null, headers[k][summarySourceToType(listType)])
      };
    }
  });

  return (
    <>
      {hasFilter && (
        <ListFilter
          listCount={prescriptionCount}
          handleFilter={handleFilter}
          isFilterActive={isFilterActive}
        />
      )}

      {Object.keys(groups).map(g => (
        <Collapse bordered={false} key={g} defaultActiveKey={groups[g].checked ? [] : ['1']}>
          <GroupPanel
            header={groupHeader(g)}
            key="1"
            className={groups[g].checked ? 'checked' : ''}
            extra={groupSummary(groups[g])}
          >
            {list(groups[g].ids)}
          </GroupPanel>
        </Collapse>
      ))}
      <FormIntervention
        visible={visible}
        setVisibility={setVisibility}
        checkPrescriptionDrug={checkPrescriptionDrug}
      />
      <ModalPrescriptionDrug
        visible={openPrescriptionDrugModal}
        setVisibility={setOpenPrescriptionDrugModal}
      />
    </>
  );
}
