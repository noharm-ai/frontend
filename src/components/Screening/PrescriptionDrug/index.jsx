import 'styled-components/macro';
import React from 'react';
import isEmpty from 'lodash.isempty';

import { Row, Col } from '@components/Grid';
import Heading from '@components/Heading';
import Editor from '@components/Editor';
import LoadBox from '@components/LoadBox';

import { Box, EditorBox } from './PrescriptionDrug.style';

const Drug = ({ drug, dosage, frequency, route }) => (
  <Box>
    <Row type="flex" gutter={24} css="padding: 2px 0">
      <Col span={8}>
        <Heading as="p" size="14px">
          Medicamento:
        </Heading>
      </Col>
      <Col span={24 - 8}>{drug}</Col>
    </Row>
    <Row type="flex" gutter={24} css="padding: 2px 0">
      <Col span={8}>
        <Heading as="p" size="14px">
          Dose:
        </Heading>
      </Col>
      <Col span={24 - 8}>{dosage}</Col>
    </Row>
    <Row type="flex" gutter={24} css="padding: 2px 0">
      <Col span={8}>
        <Heading as="p" size="14px">
          Frequência:
        </Heading>
      </Col>
      <Col span={24 - 8}>{frequency && `${frequency.value} ${frequency.label}`}</Col>
    </Row>
    <Row type="flex" gutter={24} css="padding: 2px 0">
      <Col span={8}>
        <Heading as="p" size="14px">
          Via:
        </Heading>
      </Col>
      <Col span={24 - 8}>{route}</Col>
    </Row>
  </Box>
);

const Observations = ({ content, onEditObservation }) => {
  const onEdit = notes => {
    onEditObservation({ notes });
  };

  return (
    <Box>
      <EditorBox>
        <Editor onEdit={onEdit} content={content || ''} />
      </EditorBox>
    </Box>
  );
};

export default function PrescriptionDrug({ prescriptionDrug, update }) {
  const { item: itemToSave } = prescriptionDrug;

  if (isEmpty(itemToSave)) {
    return <LoadBox />;
  }

  return (
    <>
      <header>
        <Heading margin="0 0 11px">Anotações</Heading>
      </header>
      <Drug {...itemToSave} />

      <Observations content={!isEmpty(itemToSave) && itemToSave.notes} onEditObservation={update} />
    </>
  );
}
