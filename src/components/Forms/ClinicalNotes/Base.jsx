import React from 'react';
import 'styled-components/macro';
import isEmpty from 'lodash.isempty';
import { useFormikContext } from 'formik';

import { Col } from '@components/Grid';
import { Textarea, Select } from '@components/Inputs';

import Tooltip from '@components/Tooltip';
import Button from '@components/Button';
import Heading from '@components/Heading';

import getInterventionTemplate from './util/getInterventionTemplate';
import { Box, EditorBox, FieldError } from '../Form.style';

export default function Base({ prescription, account, signature }) {
  const { values, setFieldValue, errors, touched } = useFormikContext();
  const { notes, concilia } = values;
  const layout = { label: 2, input: 20 };

  const loadDefaultText = () => {
    setFieldValue('notes', getInterventionTemplate(prescription, account, signature, concilia));
  };

  const openUserConfig = () => {
    window.open('/configuracoes/usuario');
  };

  return (
    <>
      {prescription.data.concilia && (
        <Box hasError={errors.concilia && touched.concilia}>
          <Col xs={layout.label}>
            <Heading as="label" size="14px">
              <Tooltip title="Informe o tipo desta conciliação">Tipo:</Tooltip>
            </Heading>
          </Col>
          <Col xs={layout.input}>
            <Select
              placeholder="Selecione o tipo de conciliação"
              onChange={value => setFieldValue('concilia', value)}
              value={concilia}
              identify="concilia"
              allowClear
              style={{ minWidth: '300px' }}
            >
              <Select.Option value="b" key="b">
                Admissão
              </Select.Option>
              <Select.Option value="a" key="a">
                Alta
              </Select.Option>
              <Select.Option value="n" key="n">
                Não realizada
              </Select.Option>
              <Select.Option value="t" key="t">
                Transferência
              </Select.Option>
            </Select>
            {errors.concilia && touched.concilia && <FieldError>{errors.concilia}</FieldError>}
          </Col>
        </Box>
      )}
      <Col xs={24} style={{ textAlign: 'right', padding: '0 8px' }}>
        <Tooltip title="Aplicar evolução modelo">
          <Button
            shape="circle"
            icon="download"
            onClick={loadDefaultText}
            type="primary gtm-bt-clinicalNotes-applyDefaultText"
          />
        </Tooltip>
        {(isEmpty(signature.list) || signature.list[0].value === '') && (
          <Tooltip title="Configurar assinatura padrão">
            <Button
              shape="circle"
              icon="setting"
              onClick={openUserConfig}
              type="primary gtm-bt-clinicalNotes-configDefaultText"
              style={{ marginLeft: '5px' }}
            />
          </Tooltip>
        )}
      </Col>
      <Box hasError={errors.notes} flexDirection="column">
        <Col xs={24}>
          <EditorBox>
            <Textarea
              autoFocus
              value={notes}
              onChange={({ target }) => setFieldValue('notes', target.value)}
              style={{ minHeight: '300px' }}
            />
            {errors.notes && touched.notes && <FieldError>{errors.notes}</FieldError>}
          </EditorBox>
        </Col>
      </Box>
    </>
  );
}
