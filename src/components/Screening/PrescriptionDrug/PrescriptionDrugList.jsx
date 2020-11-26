import React, { useState } from 'react';
import isEmpty from 'lodash.isempty';
import { format, parseISO } from 'date-fns';

import Icon from '@components/Icon';
import LoadBox from '@components/LoadBox';
import { ExpandableTable } from '@components/Table';
import Empty from '@components/Empty';
import Collapse from '@components/Collapse';
import Tooltip from '@components/Tooltip';
import Button from '@components/Button';
import TableFilter from '@components/TableFilter';
import Tag from '@components/Tag';

import ModalIntervention from '@containers/Screening/ModalIntervention';
import ModalPrescriptionDrug from '@containers/Screening/ModalPrescriptionDrug';

import columnsTable, { expandedRowRender, solutionColumns, isPendingValidation } from '../columns';
import { GroupPanel, PrescriptionPanel, PrescriptionHeader } from './PrescriptionDrug.style';

const isExpired = date => {
  if (parseISO(date).getTime() < Date.now()) {
    return true;
  }

  return false;
};

const rowClassName = record => {
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

  if (record.status === 's') {
    classes.push('danger');
  }

  return classes.join(' ');
};

export default function PrescriptionDrugList({
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
  selectPrescriptionDrug
}) {
  const [visible, setVisibility] = useState(false);
  const [openPrescriptionDrugModal, setOpenPrescriptionDrugModal] = useState(false);
  const [expandedRows, setExpandedRows] = useState([]);
  const [filter, setFilter] = useState({
    status: null
  });

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

  const updateExpandedRows = (list, key) => {
    if (list.includes(key)) {
      return list.filter(i => i !== key);
    }
    return [...list, key];
  };

  const handleRowExpand = record => {
    setExpandedRows(updateExpandedRows(expandedRows, record.key));
  };

  const bag = {
    onShowModal,
    onShowPrescriptionDrugModal,
    handleRowExpand,
    check: checkPrescriptionDrug,
    savePrescriptionDrugStatus,
    idSegment,
    admissionNumber,
    saveInterventionStatus,
    checkIntervention,
    periodObject,
    fetchPeriod,
    weight
  };

  const prescriptionCount = {
    all: listRaw ? listRaw.length : 0,
    pendingValidation: listRaw ? listRaw.reduce((n, i) => n + isPendingValidation(i), 0) : 0
  };

  const ListFilter = ({ listCount, handleFilter, isFilterActive }) => (
    <TableFilter style={{ marginBottom: 15 }}>
      <Tooltip title="Ver somente pendentes de validação">
        <Button
          type="gtm-lnk-filter-presc-pendentevalidacao ant-btn-link-hover"
          className={isFilterActive('pending-validation') ? 'active' : ''}
          onClick={e => handleFilter(e, 'pending-validation')}
        >
          Pendentes de validação
          <Tag color="orange">{listCount.pendingValidation}</Tag>
        </Button>
      </Tooltip>
      <Tooltip title="Ver todos">
        <Button
          type="gtm-lnk-filter-presc-todos ant-btn-link-hover"
          className={isFilterActive(null) ? 'active' : ''}
          onClick={e => handleFilter(e, 'all')}
        >
          Todos
          <Tag>{listCount.all}</Tag>
        </Button>
      </Tooltip>
    </TableFilter>
  );

  const table = ds => (
    <ExpandableTable
      columns={columnsTable(filter, bag)}
      pagination={false}
      loading={isFetching}
      locale={{
        emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyMessage} />
      }}
      dataSource={!isFetching ? ds.value : []}
      expandedRowRender={expandedRowRender(bag)}
      rowClassName={rowClassName}
      expandedRowKeys={expandedRows}
      onExpand={(expanded, record) => handleRowExpand(record)}
    />
  );

  const panelHeader = ds => (
    <PrescriptionHeader className="panel-header">
      <div className="title">
        <strong className="p-number">
          Prescrição &nbsp;
          <a href={`/prescricao/${ds.key}`} target="_blank" rel="noopener noreferrer">
            # {ds.key}
          </a>
        </strong>
      </div>
      <div className="subtitle">
        <span style={{ paddingLeft: 0 }}>
          <strong>Liberação:</strong> &nbsp;
          {format(new Date(headers[ds.key].date), 'dd/MM/yyyy HH:mm')}
        </span>
        <span>
          <strong>Vigência:</strong> &nbsp;
          <span className={isExpired(headers[ds.key].expire, true) ? 'expired' : ''}>
            {format(new Date(headers[ds.key].expire), 'dd/MM/yyyy HH:mm')}
          </span>
        </span>
        <span>
          <strong>Leito:</strong> &nbsp;
          {headers[ds.key].bed}
        </span>
        <span>
          <strong>Prescritor:</strong> &nbsp;
          {headers[ds.key].prescriber}
        </span>
      </div>
    </PrescriptionHeader>
  );

  const groupHeader = dt => (
    <PrescriptionHeader>
      <span style={{ fontSize: '16px' }}>
        <strong>Vigência:</strong> &nbsp;
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
              extra={headers[ds.key].status === 's' ? infoIcon('Prescrição checada') : null}
            >
              {table(ds)}
            </PrescriptionPanel>
          </Collapse>
        )}
      </div>
    ));
  };

  if (!aggregated) {
    return table(!isEmpty(dataSource) ? dataSource[0] : []);
  }

  const groups = {};
  Object.keys(headers).forEach(k => {
    const dt = headers[k].expire.substr(0, 10);

    if (groups[dt]) {
      groups[dt].ids.push(k);
      if (headers[k].status !== 's') {
        groups[dt].checked = false;
      }
    } else {
      groups[dt] = {
        checked: headers[k].status === 's',
        ids: [k]
      };
    }
  });

  return (
    <>
      <ListFilter
        listCount={prescriptionCount}
        handleFilter={handleFilter}
        isFilterActive={isFilterActive}
      />
      {Object.keys(groups).map(g => (
        <Collapse bordered={false} key={g} defaultActiveKey={groups[g].checked ? [] : ['1']}>
          <GroupPanel
            header={groupHeader(g)}
            key="1"
            className={groups[g].checked ? 'checked' : ''}
            extra={
              groups[g].checked
                ? infoIcon('Todas as prescrições desta vigência já foram checadas')
                : null
            }
          >
            {list(groups[g].ids)}
          </GroupPanel>
        </Collapse>
      ))}
      <ModalIntervention visible={visible} setVisibility={setVisibility} />
      <ModalPrescriptionDrug
        visible={openPrescriptionDrugModal}
        setVisibility={setOpenPrescriptionDrugModal}
      />
    </>
  );
}
