import React, { useEffect, useState } from 'react';
import isEmpty from 'lodash.isempty';
import styled from 'styled-components/macro';
import debounce from 'lodash.debounce';

import breakpoints from '@styles/breakpoints';
import { useMedia } from '@lib/hooks';
import Empty from '@components/Empty';
import Table from '@components/Table';
import notification from '@components/notification';
import Button from '@components/Button';
import Tooltip from '@components/Tooltip';
import Tag from '@components/Tag';
import { useTranslation } from 'react-i18next';
import { InfoIcon } from '@components/Icon';
import BackTop from '@components/BackTop';
import { Input } from '@components/Inputs';
import Filter from './Filter';
import { toDataSource } from '@utils';

import columnsTable, { expandedRowRender } from './columns';

const ScreeningTable = styled(Table)`
  .ant-table-title {
    padding: 0;
  }

  .ant-table-expanded-row > td {
    border-bottom: 1px solid rgba(0, 0, 0, 0.3);
  }
`;

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

  .ant-input-affix-wrapper {
    margin-right: 10px;

    &.active {
      input {
        border-color: #096dd9;
        background-color: #eee;
      }
    }
  }
`;

// empty text for table result.
const emptyText = (
  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Nenhum paciente encontrado." />
);
// error message when fetch has error.
const errorMessage = {
  message: 'Ops! Algo de errado aconteceu.',
  description: 'Aconteceu algo que nos impediu de lhe mostrar os dados, por favor, tente novamente.'
};
const noop = () => {};
const theTitle = () => 'Deslize para a direita para ver mais conteúdo.';

export default function ScreeningList({
  prescriptions,
  fetchSegmentsList,
  fetchPrescriptionsList,
  checkScreening,
  prioritizationType,
  security,
  ...restProps
}) {
  const [sortOrder, setSortOrder] = useState({
    order: null,
    columnKey: null
  });
  const [filter, setFilter] = useState({
    status: null,
    searchKey: null
  });
  const { isFetching, list, error, check } = prescriptions;
  const bag = {
    checkScreening,
    check,
    prioritizationType
  };
  const dataSource = toDataSource(list, null, bag);
  const columns = columnsTable(sortOrder, filter, security.hasRole('care'));
  const [title] = useMedia([`(max-width: ${breakpoints.lg})`], [[theTitle]], [noop]);
  const listCount = {
    all: list ? list.length : 0,
    pending: 0,
    checked: 0
  };

  const { t } = useTranslation();

  if (list) {
    list.forEach(item => {
      if (item.status === 's') {
        listCount.checked += 1;
      } else {
        listCount.pending += 1;
      }
    });
  }

  // fetch data
  useEffect(() => {
    fetchSegmentsList();
  }, [fetchSegmentsList]);

  // show message if has error
  useEffect(() => {
    if (!isEmpty(error)) {
      notification.error(errorMessage);
    }
  }, [error]);

  useEffect(() => {
    setFilter({ ...filter, searchKey: null });
  }, [isFetching]); //eslint-disable-line

  const handleFilter = (e, status) => {
    if (status) {
      setFilter({ status: status === 'all' ? null : [status] });
      return;
    }

    if (filter.status == null) {
      setFilter({ status: ['s'] });
    } else if (filter.status[0] === 's') {
      setFilter({ status: ['0'] });
    } else {
      setFilter({ status: null });
    }
  };

  const onClientSearch = ev => {
    ev.persist();

    if (ev.target.value === '') {
      setFilter({ ...filter, searchKey: null });
      return;
    }

    debounce(e => {
      if (e.target.value !== '' && e.target.value.length > 3) {
        setFilter({ ...filter, searchKey: [e.target.value.toLowerCase()] });
      } else if (filter.searchKey) {
        setFilter({ ...filter, searchKey: null });
      }
    }, 800)(ev);
  };

  const handleTableChange = (pagination, filters, sorter) => {
    setSortOrder(sorter);
  };

  const isFilterActive = status => {
    if (filter.status) {
      return filter.status[0] === status;
    }

    return filter.status == null && status == null;
  };

  const info = (
    <TableInfo>
      <Input
        placeholder="Buscar por paciente ou nº atendimento"
        style={{ width: 300 }}
        allowClear
        onChange={onClientSearch}
        className={filter.searchKey ? 'active' : ''}
      />
      <Tooltip title="Ver prescrições pendentes">
        <Button
          type="gtm-lnk-filter-presc-pendente ant-btn-link-hover"
          className={isFilterActive('0') ? 'active' : ''}
          onClick={e => handleFilter(e, '0')}
        >
          {t('screeningList.pending')}
          <Tag color="orange">{listCount.pending}</Tag>
        </Button>
      </Tooltip>

      <Tooltip title="Ver prescrições checadas">
        <Button
          type="gtm-lnk-filter-presc-checada ant-btn-link-hover"
          className={isFilterActive('s') ? 'active' : ''}
          onClick={e => handleFilter(e, 's')}
        >
          {t('screeningList.checked')} <Tag color="green">{listCount.checked}</Tag>
        </Button>
      </Tooltip>

      <Tooltip
        title={
          listCount.all === 500
            ? 'Limite de 500 prescrições atingido, reduza os setores para visualizar todas do dia.'
            : 'Ver todas prescrições'
        }
      >
        <Button
          type="gtm-lnk-filter-presc-todas ant-btn-link-hover"
          className={isFilterActive(null) ? 'active' : ''}
          onClick={e => handleFilter(e, 'all')}
        >
          {t('screeningList.all')} {listCount.all === 500 ? <InfoIcon /> : ''}
          <Tag>{listCount.all}</Tag>
        </Button>
      </Tooltip>
    </TableInfo>
  );

  return (
    <>
      <Filter
        {...restProps}
        prioritizationType={prioritizationType}
        fetchPrescriptionsList={fetchPrescriptionsList}
        isFetchingPrescription={isFetching}
        hasPeriodLimit={!security.hasRole('nolimit')}
      />
      {!isFetching && info}
      <ScreeningTable
        title={title}
        columns={columns}
        pagination={{
          pageSize: 50,
          position: 'both'
        }}
        loading={isFetching}
        locale={{ emptyText }}
        expandedRowRender={expandedRowRender}
        dataSource={!isFetching ? dataSource : []}
        onChange={handleTableChange}
      />

      <BackTop />
    </>
  );
}
