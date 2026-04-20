import { useEffect } from "react";
import { useFormikContext } from "formik";

import { Col } from "components/Grid";
import { Input } from "components/Inputs";
import Heading from "components/Heading";
import { Box, FieldError } from "components/Forms/Form.style";

interface BaseProps {
  success: boolean;
}

export function Base({ success }: BaseProps) {
  const { values, setFieldValue, errors, touched, resetForm } =
    useFormikContext<{
      password: string;
      newpassword: string;
      confirmPassword: string;
    }>();
  const { password, newpassword, confirmPassword } = values;
  const layout = { label: 10, input: 14 };

  useEffect(() => {
    if (success) {
      resetForm();
    }
  }, [resetForm, success]);

  return (
    <>
      {/* @ts-expect-error - Box is a JS styled component without TypeScript prop types */}
      <Box hasError={errors.password && touched.password}>
        <Col xs={layout.label}>
          {/* @ts-expect-error - Heading is a JS component without TypeScript prop types */}
          <Heading as="label" $size="14px">
            Senha atual:
          </Heading>
        </Col>
        <Col xs={layout.input}>
          <Input.Password
            value={password}
            onChange={({ target }: React.ChangeEvent<HTMLInputElement>) =>
              setFieldValue("password", target.value)
            }
          />
          {errors.password && touched.password && (
            <FieldError>{errors.password}</FieldError>
          )}
        </Col>
      </Box>
      {/* @ts-expect-error - Box is a JS styled component without TypeScript prop types */}
      <Box hasError={errors.newpassword && touched.newpassword}>
        <Col xs={layout.label}>
          {/* @ts-expect-error - Heading is a JS component without TypeScript prop types */}
          <Heading as="label" $size="14px">
            Nova senha:
          </Heading>
        </Col>
        <Col xs={layout.input}>
          <Input.Password
            value={newpassword}
            onChange={({ target }: React.ChangeEvent<HTMLInputElement>) =>
              setFieldValue("newpassword", target.value)
            }
          />
          {errors.newpassword && touched.newpassword && (
            <FieldError>{errors.newpassword}</FieldError>
          )}
        </Col>
      </Box>
      {/* @ts-expect-error - Box is a JS styled component without TypeScript prop types */}
      <Box hasError={errors.confirmPassword && touched.confirmPassword}>
        <Col xs={layout.label}>
          {/* @ts-expect-error - Heading is a JS component without TypeScript prop types */}
          <Heading as="label" $size="14px">
            Confirmar senha:
          </Heading>
        </Col>
        <Col xs={layout.input}>
          <Input.Password
            value={confirmPassword}
            onChange={({ target }: React.ChangeEvent<HTMLInputElement>) =>
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
