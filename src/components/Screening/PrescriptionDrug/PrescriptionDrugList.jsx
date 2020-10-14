import React from 'react';
import styled from 'styled-components/macro';
import isEmpty from 'lodash.isempty';
import { format } from 'date-fns';

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

  const infoIcon = ds => {
    if (headers[ds.key].status === 's') {
      return (
        <Tooltip title="Prescrição checada">
          <Icon type="check" style={{ fontSize: 18, color: '#52c41a' }} />
        </Tooltip>
      );
    }

    return null;
  };

  if (!aggregated) {
    return table(!isEmpty(dataSource) ? dataSource[0] : []);
  }

  return dataSource.map((ds, index) => (
    <div key={index}>
      {aggregated && (
        <Collapse bordered defaultActiveKey={headers[ds.key].status === 's' ? [] : ['1']}>
          <PrescriptionPanel
            header={panelHeader(ds)}
            key="1"
            className={headers[ds.key].status === 's' ? 'checked' : ''}
            extra={infoIcon(ds)}
          >
            {table(ds)}
          </PrescriptionPanel>
        </Collapse>
      )}
    </div>
  ));
}
