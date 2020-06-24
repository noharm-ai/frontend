import React, { useEffect } from 'react';
import isEmpty from 'lodash.isempty';
import { Row, Col } from 'antd';

import Tabs from '@components/Tabs';
import Button from '@components/Button';
import FormSegment from '@containers/Forms/Segment';

import feedback from './feedback';
import Filter from './Filter';

function Segments({
  segments,
  match,
  outliers,
  generateOutlier,
  resetGenerate,
  fetchSegmentsList,
  fetchSegmentById,
  security
}) {
  const { generate } = outliers;

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
          Aqui vao os exames! :)
        </Tabs.TabPane>
      </Tabs>
    </>
  );
}

export default Segments;
