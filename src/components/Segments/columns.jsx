import styled from 'styled-components/macro';
import React from 'react';

import Icon from '@components/Icon';
import Button, { Link } from '@components/Button';

const ActionsBox = styled.div`
  text-align: center;

  .ant-btn:first-child {
    margin-bottom: 10px;
  }

  @media (min-width: 768px) {
    text-align: right;

    .ant-btn:first-child {
      margin-right: 10px;
    }
  }
`;

const SegmentActions = ({ id, slug, outliers, generateOutlier, description: nameSegment }) => {
  const { generate: item } = outliers;

  const isDisabled = item.idSegment !== id && item.isGenerating;
  const isGenerating = item.idSegment === id && item.isGenerating;

  const generate = () =>
    generateOutlier({
      id,
      nameSegment
    });

  return (
    <ActionsBox>
      <Button type="secondary" loading={isGenerating} disabled={isDisabled} onClick={generate}>
        Gerar Outler
      </Button>
      <Link type="primary" to={`/segmentos/editar/${slug}`}>
        <Icon type="edit" />
        Editar
      </Link>
    </ActionsBox>
  );
};

export default [
  {
    title: 'Nome do segmento',
    dataIndex: 'description'
  },
  {
    title: 'Idade (Anos)',
    dataIndex: 'minMaxAge'
  },
  {
    title: 'Peso (Kg)',
    dataIndex: 'minMaxWeight'
  },
  {
    title: 'Ações',
    dataIndex: 'id',
    width: 300,
    render: (text, record) => <SegmentActions {...record} />
  }
].map(item => ({ ...item, key: item.dataIndex }));
