import React from 'react';
import 'styled-components/macro';
import { useFormikContext } from 'formik';

import { Col } from '@components/Grid';
import { Input } from '@components/Inputs';
import Heading from '@components/Heading';

import { Box, FieldError } from '../../Forms/Form.style';

export default function Base() {
  const { values, setFieldValue, errors, touched } = useFormikContext();
  const { currentPassword, newPassword, confirmPassword } = values;
  const layout = { label: 10, input: 14 };

  return (
    <>
      <Box hasError={errors.currentPassword && touched.currentPassword}>
        <Col xs={layout.label}>
          <Heading as="label" size="14px">
            Senha atual:
          </Heading>
        </Col>
        <Col xs={layout.input}>
          <Input.Password
            value={currentPassword}
            onChange={({ target }) => setFieldValue('currentPassword', target.value)}
          />
          {errors.currentPassword && touched.currentPassword && (
            <FieldError>{errors.currentPassword}</FieldError>
          )}
        </Col>
      </Box>
      <Box hasError={errors.newPassword && touched.newPassword}>
        <Col xs={layout.label}>
          <Heading as="label" size="14px">
            Nova senha:
          </Heading>
        </Col>
        <Col xs={layout.input}>
          <Input.Password
            value={newPassword}
            onChange={({ target }) => setFieldValue('newPassword', target.value)}
          />
          {errors.newPassword && touched.newPassword && (
            <FieldError>{errors.newPassword}</FieldError>
          )}
        </Col>
      </Box>
      <Box hasError={errors.confirmPassword && touched.confirmPassword}>
        <Col xs={layout.label}>
          <Heading as="label" size="14px">
            Confirmar senha:
          </Heading>
        </Col>
        <Col xs={layout.input}>
          <Input.Password
            value={confirmPassword}
            onChange={({ target }) => setFieldValue('confirmPassword', target.value)}
          />
          {errors.confirmPassword && touched.confirmPassword && (
            <FieldError>{errors.confirmPassword}</FieldError>
          )}
        </Col>
      </Box>
    </>
  );
}
