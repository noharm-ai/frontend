import React from 'react';
import styled from 'styled-components/macro';

import { Row, Col } from '@components/Grid';
import Heading from '@components/Heading';
import Editor from '@components/Editor';
import RichTextView from '@components/RichTextView';
import Switch from '@components/Switch';
import { get } from '@styles/utils';

import { getTypeName } from './columns';

export const Box = styled.div`
  border-top: 1px solid ${get('colors.detail')};
  padding: 20px 0;
`;

export const EditorBox = styled.div`
  .ck-content {
    min-height: 100px;
  }
`;

export default function Edit({ relation, update }) {
  const onEditObs = text => {
    update({ text });
  };

  return (
    <>
      <header>
        <Heading margin="0 0 11px">Relação</Heading>
      </header>
      <Box>
        <Row type="flex" gutter={24} css="padding: 7px 0">
          <Col span={8}>
            <Heading as="p" size="14px">
              Medicamento:
            </Heading>
          </Col>
          <Col span={24 - 8}>{relation.item.sctNameA}</Col>
        </Row>
        <Row type="flex" gutter={24} css="padding: 7px 0">
          <Col span={8}>
            <Heading as="p" size="14px">
              Relação:
            </Heading>
          </Col>
          <Col span={24 - 8}>{relation.item.nameB}</Col>
        </Row>
        <Row type="flex" gutter={24} css="padding: 7px 0">
          <Col span={8}>
            <Heading as="p" size="14px">
              Tipo:
            </Heading>
          </Col>
          <Col span={24 - 8}>{getTypeName(relation.item.type, relation.item.relationTypes)}</Col>
        </Row>
        {!relation.item.editable && (
          <Row type="flex" gutter={24} css="padding: 7px 0">
            <Col span={8}>
              <Heading as="p" size="14px">
                Texto:
              </Heading>
            </Col>
            <Col span={24 - 8}>
              <RichTextView text={relation.item.text} />
            </Col>
          </Row>
        )}
        {relation.item.editable && (
          <Row type="flex" gutter={24} css="padding: 7px 0">
            <Col span={24}>
              <Heading as="p" size="14px">
                Texto:
              </Heading>
            </Col>
            <Col span={24}>
              <EditorBox>
                <Editor content={relation.item.text || ''} onEdit={onEditObs} readOnly={true} />
              </EditorBox>
            </Col>
          </Row>
        )}

        <Row type="flex" gutter={24} css="padding: 7px 0">
          <Col span={8}>
            <Heading as="p" size="14px">
              Ativo:
            </Heading>
          </Col>
          <Col span={24 - 8}>
            <Switch onChange={active => update({ active })} checked={relation.item.active} />
          </Col>
        </Row>
      </Box>
    </>
  );
}
