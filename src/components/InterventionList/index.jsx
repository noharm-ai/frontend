import React, { useEffect, useState } from 'react';
import isEmpty from 'lodash.isempty';
import styled from 'styled-components/macro';

import Empty from '@components/Empty';
import LoadBox from '@components/LoadBox';
import notification from '@components/notification';
import { ExpandableTable } from '@components/Table';
import interventionColumns, {
  expandedInterventionRowRender
} from '@components/Screening/Intervention/columns';
import ModalIntervention from '@containers/Screening/ModalIntervention';
import Button from '@components/Button';
import Tag from '@components/Tag';
import Tooltip from '@components/Tooltip';
import BackTop from '@components/BackTop';
import { InfoIcon } from '@components/Icon';
import { toDataSource } from '@utils';

const errorMessage = {
  message: 'Ops! Algo de errado aconteceu.',
  description: 'Aconteceu algo que nos impediu de lhe mostrar os dados, por favor, tente novamente.'
};

const TableInfo = styled.span`
  span {
    margin-left: 10px;
  }

  button span {
    color: rgba(0, 0, 0, 0.65);
    font-size: 14px;
  }

  button {
    margin-right: 10px;
    margin-bottom: 15px;
  }

  button.active {
    background-color: #eee;
  }
`;

export default function InterventionList({
  fetchList,
  checkData,
  checkIntervention,
  select,
  updateList,
  futurePrescription,
  fetchFuturePrescription,
  isFetching,
  list,
  error
}) {
  const [visible, setVisibility] = useState(false);
  const [filter, setFilter] = useState({
    status: null
  });
  const onShowModal = data => {
    select({
      dosage: `${data.dose} ${data.measureUnit.value}`,
      frequency: data.frequency,
      drug: data.drugName,
      route: data.route,
      intervention: data
    });
    setVisibility(true);
  };

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

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // show message if has error
  useEffect(() => {
    if (!isEmpty(error)) {
      notification.error(errorMessage);
    }
  }, [error]);

  const afterSaveIntervention = item => {
    updateList(item);
  };

  if (isFetching) {
    return <LoadBox />;
  }

  const dsInterventions = toDataSource(list, null, {
    check: checkData,
    saveInterventionStatus: checkIntervention,
    onShowModal,
    futurePrescription,
    fetchFuturePrescription
  });
  const listCount = {
    all: list ? list.length : 0,
    pending: 0,
    accepted: 0,
    notAccepted: 0,
    notApplicable: 0
  };

  if (list) {
    list.forEach(item => {
      switch (item.status) {
        case 'a':
          listCount.accepted += 1;
          break;
        case 'n':
          listCount.notAccepted += 1;
          break;
        case 'x':
          listCount.notApplicable += 1;
          break;
        default:
          listCount.pending += 1;
      }
    });
  }

  return (
    <>
      <TableInfo style={{ marginBottom: 15 }}>
        <Tooltip title="Ver intervenções pendentes">
          <Button
            type="gtm-lnk-filter-intrv-pendente ant-btn-link-hover"
            className={isFilterActive('s') ? 'active' : ''}
            onClick={e => handleFilter(e, 's')}
          >
            Pendentes
            <Tag color="orange">{listCount.pending}</Tag>
          </Button>
        </Tooltip>

        <Tooltip title="Ver intervenções aceitas">
          <Button
            type="gtm-lnk-filter-intrv-aceita ant-btn-link-hover"
            className={isFilterActive('a') ? 'active' : ''}
            onClick={e => handleFilter(e, 'a')}
          >
            Aceitas <Tag color="green">{listCount.accepted}</Tag>
          </Button>
        </Tooltip>

        <Tooltip title="Ver intervenções não aceitas">
          <Button
            type="gtm-lnk-filter-intrv-naoaceita ant-btn-link-hover"
            className={isFilterActive('n') ? 'active' : ''}
            onClick={e => handleFilter(e, 'n')}
          >
            Não aceitas <Tag color="red">{listCount.notAccepted}</Tag>
          </Button>
        </Tooltip>

        <Tooltip title="Ver intervenções com situação Não se aplica">
          <Button
            type="gtm-lnk-filter-intrv-naoseaplica ant-btn-link-hover"
            className={isFilterActive('x') ? 'active' : ''}
            onClick={e => handleFilter(e, 'x')}
          >
            Não se aplica
            <Tag>{listCount.notApplicable}</Tag>
          </Button>
        </Tooltip>

        <Tooltip
          title={
            listCount.all === 500
              ? 'Ver todas intervenções (a lista foi limitada em 500 registros)'
              : 'Ver todas intervenções'
          }
        >
          <Button
            type="gtm-lnk-filter-intrv-todas ant-btn-link-hover"
            className={isFilterActive(null) ? 'active' : ''}
            onClick={e => handleFilter(e, 'all')}
          >
            Todas {listCount.all === 500 ? <InfoIcon /> : ''}
            <Tag>{listCount.all}</Tag>
          </Button>
        </Tooltip>
      </TableInfo>

      <BackTop />

      <ExpandableTable
        columns={interventionColumns(filter, true)}
        pagination={{
          pageSize: 50,
          position: 'both'
        }}
        loading={isFetching}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Parabéns! Nenhuma intervenção pendente."
            />
          )
        }}
        dataSource={!isFetching ? dsInterventions : []}
        expandedRowRender={expandedInterventionRowRender}
      />
      <ModalIntervention
        visible={visible}
        setVisibility={setVisibility}
        afterSaveIntervention={afterSaveIntervention}
        disableUndoIntervention
      />
    </>
  );
}
