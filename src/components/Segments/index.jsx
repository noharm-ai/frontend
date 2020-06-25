import React, { useEffect, useState, useCallback } from 'react';
import isEmpty from 'lodash.isempty';
import { Row, Col } from 'antd';

import { toDataSource } from '@utils';
import Tabs from '@components/Tabs';
import Button from '@components/Button';
import Table from '@components/Table';
import Empty from '@components/Empty';
import Icon from '@components/Icon';
import FormSegment from '@containers/Forms/Segment';
import FormExamModal from '@containers/Forms/Exam';

import feedback from './feedback';
import Filter from './Filter';
import examColumns from './Exam/columns';

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
  selectExam
}) {
  const [examModalVisible, setExamModalVisibility] = useState(false);
  const { generate } = outliers;
  const { single: currentSegment } = segments;

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

  const afterSaveSegment = () => {
    console.log('after save segment');
  };

  const generateOutlierClick = () =>
    generateOutlier({
      id: segments.firstFilter.idSegment
    });

  return (
    <>
      <Row>
        <Col xs={12}>
          <Filter segments={segments} />
        </Col>
        <Col xs={12} style={{ textAlign: 'right' }}>
          {security.isAdmin() && (
            <Button
              type="secondary"
              loading={outliers.generate.isGenerating}
              disabled={outliers.generate.isGenerating}
              onClick={generateOutlierClick}
            >
              Gerar Outlier
            </Button>
          )}
        </Col>
      </Row>

      <Tabs defaultActiveKey="1" style={{ width: '100%', marginTop: '20px' }} type="card">
        {security.isAdmin() && (
          <Tabs.TabPane tab="Setores" key="1">
            <FormSegment afterSaveSegment={afterSaveSegment} />
          </Tabs.TabPane>
        )}

        <Tabs.TabPane tab="Exames" key="2">
          <Row type="flex" justify="end">
            <Button type="primary gtm-bt-add-exam" onClick={addExamModal}>
              <Icon type="plus" /> Adicionar
            </Button>
          </Row>
          <Table
            columns={examColumns}
            pagination={false}
            loading={currentSegment.isFetching}
            locale={{ emptyText }}
            dataSource={!currentSegment.isFetching ? dsExams : []}
          />
        </Tabs.TabPane>
      </Tabs>
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
