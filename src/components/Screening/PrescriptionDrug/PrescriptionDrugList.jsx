import React from 'react';
import styled from 'styled-components/macro';
import isEmpty from 'lodash.isempty';
import { format, parseISO } from 'date-fns';

import Icon from '@components/Icon';
import LoadBox from '@components/LoadBox';
import { ExpandableTable } from '@components/Table';
import Empty from '@components/Empty';
import Collapse from '@components/Collapse';
import Tooltip from '@components/Tooltip';

const PrescriptionHeader = styled.div`
  display: inline-block;
  padding-left: 15px;

  span {
    padding-left: 15px;
  }

  .p-number {
    padding-right: 10px;
  }

  a {
    color: rgba(0, 0, 0, 0.65);
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }
`;

const PrescriptionPanel = styled(Collapse.Panel)`
  background: #fafafa;
  margin-bottom: 10px;

  .ant-collapse-header {
    .panel-header {
      transition: transform 0.3s cubic-bezier(0.33, 1, 0.68, 1);
    }

    &:hover {
      .panel-header {
        transform: translateX(2px);
      }
    }
  }

  &.checked {
    background: #dcedc8;
  }

  .ant-collapse-content {
    background: #fff !important;
  }

  & > .ant-collapse-content > .ant-collapse-content-box {
    padding-right: 2px;
    padding-left: 2px;
  }
`;

const GroupPanel = styled(PrescriptionPanel)`
  background: #e0e8ec;
  border-bottom: 0 !important;

  &.checked {
    & > .ant-collapse-content {
      border-left: 2px solid #dcedc8;
    }

    & > .ant-collapse-content > .ant-collapse-content-box {
      &::after {
        background: #dcedc8;
      }
    }
  }

  .ant-collapse-content-active {
    padding-top: 15px;
  }

  & > .ant-collapse-content > .ant-collapse-content-box {
    padding-right: 0;
    padding-left: 10px;

    position: relative;

    &::after {
      position: absolute;
      content: ' ';
      width: 20px;
      height: 3px;
      bottom: 0;
      left: -10px;
      background: #e0e8ec;
    }
  }

  & > .ant-collapse-content {
    background: #fff !important;
    border-left: 3px solid #e0e8ec;
    border-radius: 0;
  }
`;

const rowClassName = record => {
  const classes = [];

  if (record.total) {
    classes.push('summary-row');
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
  headers,
  aggregated,
  columns,
  expandedRowRender,
  expandedRows,
  handleRowExpand
}) {
  if (isFetching) {
    return <LoadBox />;
  }

  const table = ds => (
    <ExpandableTable
      expandedRowKeys={expandedRows}
      onExpand={(expanded, record) => handleRowExpand(record)}
      columns={columns}
      pagination={false}
      loading={isFetching}
      locale={{
        emptyText: (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Nenhum medicamento encontrado."
          />
        )
      }}
      dataSource={!isFetching ? ds.value : []}
      expandedRowRender={expandedRowRender}
      rowClassName={rowClassName}
    />
  );

  const panelHeader = ds => (
    <PrescriptionHeader className="panel-header">
      <strong className="p-number">
        Prescrição &nbsp;
        <a href={`/prescricao/${ds.key}`} target="_blank" rel="noopener noreferrer">
          # {ds.key}
        </a>
      </strong>
      <span>
        <strong>Liberação:</strong> &nbsp;
        {format(new Date(headers[ds.key].date), 'dd/MM/yyyy HH:mm')}
      </span>
      <span>
        <strong>Vigência:</strong> &nbsp;
        {format(new Date(headers[ds.key].expire), 'dd/MM/yyyy HH:mm')}
      </span>
      <span>
        <strong>Leito:</strong> &nbsp;
        {headers[ds.key].bed}
      </span>
      <span>
        <strong>Prescritor:</strong> &nbsp;
        {headers[ds.key].prescriber}
      </span>
    </PrescriptionHeader>
  );

  const groupHeader = dt => (
    <PrescriptionHeader>
      <span>
        <strong>Vigência:</strong> &nbsp;
        {format(parseISO(dt), 'dd/MM/yyyy')}
      </span>
    </PrescriptionHeader>
  );

  const infoIcon = title => {
    return (
      <Tooltip title={title}>
        <Icon type="check" style={{ fontSize: 18, color: '#52c41a' }} />
      </Tooltip>
    );
  };

  const list = group => {
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

  return Object.keys(groups).map(g => (
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
  ));
}
