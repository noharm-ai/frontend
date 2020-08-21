import React from 'react';
import 'styled-components/macro';
import { useFormikContext } from 'formik';

import { Col } from '@components/Grid';
import Heading from '@components/Heading';
import { Input } from '@components/Inputs';

import { Box } from './User.style';

export default function Base({ units, security }) {
  const { values, setFieldValue } = useFormikContext();
  const {
    newPassword,
    newPasswordRepeat,
    signature
  } = values;

  return (
    <>
      <Col xs={24}>
        <Box>
          <Heading as="label" size="14px" className="fixed">
            Nova senha:
          </Heading>
          <Input
            style={{
              width: 180,
              marginRight: 5
            }}
            value={newPassword}
            onChange={value => setFieldValue('newPassword', value)}
          />{' '}
        </Box>
      </Col>
      <Col xs={24}>
        <Box>
          <Heading as="label" size="14px" className="fixed">
            Repetir Nova Senha:
          </Heading>
          <Input
            style={{
              width: 180,
              marginRight: 5
            }}
            value={newPasswordRepeat}
            onChange={value => setFieldValue('newPasswordRepeat', value)}
          />{' '}
        </Box>
      </Col> 
      <Col xs={24}>
        <Box>
          <Heading as="label" size="14px" className="fixed">
            Assinatura:
          </Heading>
          <Input
            style={{
              width: 180,
              marginRight: 5
            }}
            value={signature}
            onChange={value => setFieldValue('signature', value)}
          />{' '}
        </Box>
      </Col>
    </>
  );
}

