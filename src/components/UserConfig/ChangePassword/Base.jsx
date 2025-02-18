import React, { useEffect } from "react";
import "styled-components";
import { useFormikContext } from "formik";

import { Col } from "components/Grid";
import { Input } from "components/Inputs";
import Heading from "components/Heading";

import { Box, FieldError } from "../../Forms/Form.style";

export default function Base({ success }) {
  const { values, setFieldValue, errors, touched, resetForm } =
    useFormikContext();
  const { password, newpassword, confirmPassword } = values;
  const layout = { label: 10, input: 14 };

  useEffect(() => {
    if (success) {
      resetForm();
    }
  }, [resetForm, success]);

  return (
    <>
      <Box hasError={errors.password && touched.password}>
        <Col xs={layout.label}>
          <Heading as="label" $size="14px">
            Senha atual:
          </Heading>
        </Col>
        <Col xs={layout.input}>
          <Input.Password
            value={password}
            onChange={({ target }) => setFieldValue("password", target.value)}
          />
          {errors.password && touched.password && (
            <FieldError>{errors.password}</FieldError>
          )}
        </Col>
      </Box>
      <Box hasError={errors.newpassword && touched.newpassword}>
        <Col xs={layout.label}>
          <Heading as="label" $size="14px">
            Nova senha:
          </Heading>
        </Col>
        <Col xs={layout.input}>
          <Input.Password
            value={newpassword}
            onChange={({ target }) =>
              setFieldValue("newpassword", target.value)
            }
          />
          {errors.newpassword && touched.newpassword && (
            <FieldError>{errors.newpassword}</FieldError>
          )}
        </Col>
      </Box>
      <Box hasError={errors.confirmPassword && touched.confirmPassword}>
        <Col xs={layout.label}>
          <Heading as="label" $size="14px">
            Confirmar senha:
          </Heading>
        </Col>
        <Col xs={layout.input}>
          <Input.Password
            value={confirmPassword}
            onChange={({ target }) =>
              setFieldValue("confirmPassword", target.value)
            }
          />
          {errors.confirmPassword && touched.confirmPassword && (
            <FieldError>{errors.confirmPassword}</FieldError>
          )}
        </Col>
      </Box>
    </>
  );
}
