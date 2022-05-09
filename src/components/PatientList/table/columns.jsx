import React from 'react';
import moment from 'moment';

import { Link } from '@components/Button';
import Icon from '@components/Icon';

const Action = record => {
  return (
    <Link
      type="secondary gtm-bt-detail-patient"
      href={`/prescricao/${record.idPrescription}`}
      target="_blank"
    >
      <Icon type="search" />
    </Link>
  );
};

export default (sortedInfo, filteredInfo, t) => {
  const sortDirections = ['descend', 'ascend'];

  return [
    /*{
      key: 'idPatient',
      title: 'ID',
      sortDirections,
      sorter: (a, b) => a.idPatient - b.idPatient,
      sortOrder: sortedInfo.columnKey === 'idPatient' && sortedInfo.order,
      render: record => record.idPatient
    },*/
    {
      key: 'namePatient',
      title: t('tableHeader.patient'),
      sortDirections,
      sorter: (a, b) => a.namePatient.localeCompare(b.namePatient),
      sortOrder: sortedInfo.columnKey === 'namePatient' && sortedInfo.order,
      render: record => record.namePatient,
      filteredValue: filteredInfo.searchKey || null,
      onFilter: (value, record) =>
        record.namePatient.toLowerCase().includes(value) ||
        `${record.admissionNumber}` === value ||
        `${record.idPatient}` === value
    },
    /*{
      key: 'birthdate',
      title: t('tableHeader.birthdate'),
      sortDirections,
      sorter: (a, b) => moment(a.birthdate).unix() - moment(b.birthdate).unix(),
      sortOrder: sortedInfo.columnKey === 'birthdate' && sortedInfo.order,
      render: record => (record.birthdate ? moment(record.birthdate).format('DD/MM/YYYY') : '')
    },*/
    {
      key: 'lastAppointment',
      title: t('tableHeader.lastAppointment'),
      sortDirections,
      sorter: (a, b) => moment(a.lastAppointment).unix() - moment(b.lastAppointment).unix(),
      sortOrder: sortedInfo.columnKey === 'lastAppointment' && sortedInfo.order,
      render: record =>
        record.lastAppointment ? moment(record.lastAppointment).format('DD/MM/YYYY') : ''
    },
    {
      key: 'nextAppointment',
      title: t('tableHeader.nextAppointment'),
      sortDirections,
      sorter: (a, b) => moment(a.nextAppointment).unix() - moment(b.nextAppointment).unix(),
      sortOrder: sortedInfo.columnKey === 'nextAppointment' && sortedInfo.order,
      render: record =>
        record.nextAppointment ? moment(record.nextAppointment).format('DD/MM/YYYY') : ''
    },
    {
      title: t('tableHeader.action'),
      key: 'operations',
      width: 70,
      align: 'center',
      render: (text, record) => <Action {...record} />
    }
  ];
};
