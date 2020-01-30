import React from 'react';

import Icon from '@components/Icon';
import Button from '@components/Button';

const Action = ({ onShowModal, intervention, ...data }) => (
  <Button type="primary" onClick={() => onShowModal({ ...data, intervention })}>
    Intervenção
    {intervention && <Icon type="warning" style={{ fontSize: 16 }} />}
  </Button>
);

export const defaultAction = {
  title: 'Ações',
  dataIndex: 'intervention',
  width: 180,
  render: (text, prescription) => <Action {...prescription} />
};

export const desktopAction = {
  ...defaultAction,
  fixed: 'right'
};

export default [
  {
    title: 'Medicamento',
    dataIndex: 'drug'
  },
  {
    title: 'Dose',
    dataIndex: 'dosage',
    width: 100
  },
  {
    title: 'Frequência',
    dataIndex: 'frequency',
    width: 150
  },
  {
    title: 'Via',
    dataIndex: 'route',
    width: 85
  },
  {
    title: 'Escore',
    dataIndex: 'score',
    width: 85
  }
].map(({ dataIndex, ...column }) => ({
  ...column,
  dataIndex,
  key: dataIndex
}));
