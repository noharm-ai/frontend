import React, { useEffect, useState, useCallback } from 'react';
import isEmpty from 'lodash.isempty';
import { Row, Col } from 'antd';
import { sortableContainer, sortableElement } from 'react-sortable-hoc';

import Tabs from '@components/Tabs';
import Button from '@components/Button';
import Table from '@components/Table';
import Empty from '@components/Empty';
import Icon from '@components/Icon';
import Tooltip from '@components/Tooltip';
import PopConfirm from '@components/PopConfirm';
import BackTop from '@components/BackTop';
import notification from '@components/notification';

import FormSegment from '@containers/Forms/Segment';
import FormExamModal from '@containers/Forms/Exam';
import { toDataSource } from '@utils';

import feedback from './feedback';
import Filter from './Filter';
import examColumns from './Exam/columns';
import './index.css';

const emptyText = (
  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Nenhum dado encontrado." />
);

function Segments({
  segments,
  match,
  outliers,
  generateOutlier,
  resetGenerate,
  fetchSegmentsList,
  fetchSegmentById,
  security,
  selectExam,
  updateExamOrder,
  sortStatus
}) {
  const [enableSortExams, setEnableSortExams] = useState(true);
  const [examModalVisible, setExamModalVisibility] = useState(false);
  const { generate } = outliers;
  const { single: currentSegment, examTypes } = segments;
  const availableExamTypes = currentSegment.content.exams
    ? examTypes.list.filter(
        type => currentSegment.content.exams.findIndex(e => e.type === type) === -1
      )
    : [];

  useEffect(() => {
    fetchSegmentsList();
  }, [fetchSegmentsList]);

  useEffect(() => {
    if (!isEmpty(segments.list)) {
      if (!isEmpty(match.params)) {
        fetchSegmentById(match.params.idSegment);
      } else {
        fetchSegmentById(segments.list[0].id);
      }
    }
  }, [fetchSegmentById, match.params, segments.list]);

  useEffect(() => {
    if (generate.status) {
      feedback(generate.status, generate);
      resetGenerate();
    }
  }, [generate, resetGenerate]);

  useEffect(() => {
    if (sortStatus.error) {
      notification.error({
        message: 'Ops! Algo de errado aconteceu.',
        description:
          'Aconteceu algo que nos impediu de salvar a ordem dos exames. Por favor, tente novamente.'
      });
    }
  }, [sortStatus.error]);

  const onShowExamModal = data => {
    selectExam(data);
    setExamModalVisibility(true);
  };

  const addExamModal = () => {
    selectExam({
      new: true,
      idSegment: segments.firstFilter.idSegment,
      active: true
    });
    setExamModalVisibility(true);
  };

  const onCancelExamModal = useCallback(() => {
    setExamModalVisibility(false);
  }, [setExamModalVisibility]);

  const dsExams = toDataSource(currentSegment.content.exams, null, {
    showModal: onShowExamModal,
    idSegment: segments.firstFilter.idSegment
  });

  const onSortEnd = ({ oldIndex, newIndex }) => {
    if (oldIndex !== newIndex) {
      updateExamOrder(oldIndex, newIndex);
    }
  };

  const SortableItem = sortableElement(props => <tr {...props} />);
  const SortableContainer = sortableContainer(props => <tbody {...props} />);

  const DraggableBodyRow = ({ className, style, ...restProps }) => {
    return <SortableItem index={restProps['data-row-key']} {...restProps} />;
  };

  const DraggableContainer = props => (
    <SortableContainer useDragHandle helperClass="row-dragging" onSortEnd={onSortEnd} {...props} />
  );

  const afterSaveSegment = () => {};

  const [sortOrder, setSortOrder] = useState({
    order: null,
    columnKey: null
  });

  const handleTableChange = (pagination, filters, sorter) => {
    setSortOrder(sorter);
  };

  const generateOutlierClick = () =>
    generateOutlier({
      id: segments.firstFilter.idSegment
    });

  const toggleSortExams = () => {
    if (enableSortExams) {
      setEnableSortExams(false);
    } else {
      setSortOrder({
        order: null,
        columnKey: null
      });
      setEnableSortExams(true);
      notification.success({ message: 'Arraste os exames para a ordem desejada' });
    }
  };

  return (
    <>
      <Row>
        <Col xs={12}>
          <Filter segments={segments} />
        </Col>
        <Col xs={12} style={{ textAlign: 'right' }}>
          {security.isAdmin() && (
            <PopConfirm
              title="Essa ação irá recalcular os escores de todo o segmento. Deseja continuar?"
              onConfirm={generateOutlierClick}
              okText="Sim"
              cancelText="Não"
            >
              <Button
                type="primary gtm-bt-seg-generate"
                style={{ marginTop: '10px' }}
                loading={outliers.generate.isGenerating}
                disabled={outliers.generate.isGenerating}
              >
                Gerar Escores
              </Button>
            </PopConfirm>
          )}
        </Col>
      </Row>

      <Tabs
        defaultActiveKey="1"
        style={{ width: '100%', marginTop: '20px' }}
        type="card gtm-tab-segments"
      >
        {security.isAdmin() && (
          <Tabs.TabPane tab="Setores" key="1">
            <FormSegment afterSaveSegment={afterSaveSegment} />
          </Tabs.TabPane>
        )}

        <Tabs.TabPane tab="Exames" key="2">
          <Row type="flex" justify="end" style={{ marginBottom: '20px' }}>
            <Button
              type="gtm-bt-reorder"
              onClick={() => toggleSortExams()}
              style={{ marginRight: '5px' }}
            >
              <Icon type="menu" />{' '}
              {enableSortExams ? 'Desligar ordenação de exames' : 'Ordenar exames'}
            </Button>
            <Tooltip
              title={isEmpty(availableExamTypes) ? 'Não há exames disponíves para cadastro' : ''}
            >
              <Button
                type="primary gtm-bt-add-exam"
                onClick={addExamModal}
                disabled={isEmpty(availableExamTypes)}
              >
                <Icon type="plus" /> Adicionar
              </Button>
            </Tooltip>
          </Row>
          <Table
            columns={examColumns(sortOrder, enableSortExams)}
            pagination={false}
            loading={currentSegment.isFetching || sortStatus.isSaving}
            locale={{ emptyText }}
            dataSource={!currentSegment.isFetching ? dsExams : []}
            onChange={handleTableChange}
            components={{
              body: {
                wrapper: DraggableContainer,
                row: DraggableBodyRow
              }
            }}
          />
        </Tabs.TabPane>
      </Tabs>

      <BackTop />

      <FormExamModal
        visible={examModalVisible}
        onCancel={onCancelExamModal}
        okText="Salvar"
        okType="primary gtm-bt-save-exam"
        cancelText="Cancelar"
        afterSave={onCancelExamModal}
      />
    </>
  );
}

export default Segments;
