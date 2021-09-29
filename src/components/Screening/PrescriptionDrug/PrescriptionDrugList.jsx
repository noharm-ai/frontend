import React, { useState } from 'react';
import isEmpty from 'lodash.isempty';
import { format, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';

import LoadBox from '@components/LoadBox';
import Empty from '@components/Empty';
import Collapse from '@components/Collapse';
import Tooltip from '@components/Tooltip';
import { sourceToStoreType } from '@utils/transformers/prescriptions';

import FormIntervention from '@containers/Forms/Intervention';
import ModalPrescriptionDrug from '@containers/Screening/ModalPrescriptionDrug';

import { GroupPanel, PrescriptionPanel, PrescriptionHeader } from './PrescriptionDrug.style';
import Table from './components/Table';
import PanelAction from './components/PanelAction';

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
  listType,
  isFetching,
  dataSource,
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
  uniqueDrugs,
  checkScreening,
  isCheckingPrescription,
  security
}) {
  const [visible, setVisibility] = useState(false);
  const [openPrescriptionDrugModal, setOpenPrescriptionDrugModal] = useState(false);
  const { t } = useTranslation();

  if (isFetching) {
    return <LoadBox />;
  }

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
    headers,
    t
  };

  const table = (ds, showHeader) => (
    <Table
      hasFilter={false}
      filter={null}
      bag={bag}
      isFetching={isFetching}
      emptyMessage={emptyMessage}
      ds={ds}
      listType={listType}
      showHeader={showHeader}
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
          <Tooltip title={headers[ds.key].department} underline>
            {headers[ds.key].bed}
          </Tooltip>
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

  const prescriptionSummary = (id, header, source) => {
    return (
      <PanelAction
        id={id}
        header={header}
        source={source}
        checkScreening={checkScreening}
        isChecking={isCheckingPrescription}
      />
    );
  };

  const groupSummary = groupData => {
    return <PanelAction groupData={groupData} />;
  };

  const list = group => {
    const msg = 'Nenhuma prescrição encontrada.';

    if (isEmpty(dataSource)) {
      return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={msg} />;
    }

    if (security.hasCpoe()) {
      const cpoeListByDate = dataSource[0].value.filter(i => group.indexOf(`${i.cpoe}`) !== -1);
      return table({ key: dataSource[0].key, value: cpoeListByDate }, true);
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
                ds.key,
                headers[ds.key],
                isEmpty(ds.value) ? null : ds.value[0].source
              )}
            >
              {table(ds, true)}
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
  console.log('groups', groups);

  return (
    <>
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
