import React, { useState } from "react";
import "styled-components/macro";
import { useFormikContext } from "formik";
import { Alert } from "antd";
import { useTranslation } from "react-i18next";

import { Col } from "components/Grid";
import Heading from "components/Heading";
import { Input } from "components/Inputs";
import Switch from "components/Switch";
import Tooltip from "components/Tooltip";
import { Select } from "components/Inputs";
import Button from "components/Button";
import Role from "models/Role";

import { Box } from "../Form.style";

export default function Base({ security }) {
  const [forcePassword, setForcePassword] = useState(false);
  const { values, setFieldValue, errors, touched } = useFormikContext();
  const { name, external, active, id, roles, password } = values;
  const layout = { label: 8, input: 16 };
  const { t } = useTranslation();
  return (
    <>
      <Box hasError={errors.name}>
        <Col xs={layout.label}>
          <Heading as="label" size="14px" textAlign="right">
            <Tooltip>{t("userAdminForm.name")}</Tooltip>
          </Heading>
        </Col>
        <Col xs={layout.input}>
          <Input
            style={{
              marginLeft: 10,
            }}
            value={name}
            onChange={({ target }) => setFieldValue("name", target.value)}
            maxLength={250}
          />
        </Col>
      </Box>

      <Box hasError={errors.email && touched.email}>
        <Col xs={layout.label}>
          <Heading as="label" size="14px" textAlign="right">
            <Tooltip>{t("userAdminForm.email")}</Tooltip>
          </Heading>
        </Col>
        <Col xs={layout.input}>
          <Input
            name="email"
            type="email"
            value={values.email}
            style={{
              marginLeft: 10,
            }}
            onChange={({ target }) => setFieldValue("email", target.value)}
            maxLength={50}
            disabled={id != null}
          />
          {errors.email && touched.email && (
            <Alert
              message={t("userAdminForm.emailError")}
              type="error"
              bannder
              closable
              style={{
                marginTop: 10,
                marginLeft: 10,
              }}
            >
              {errors.email}
            </Alert>
          )}
        </Col>
      </Box>

      <Box hasError={errors.external}>
        <Col xs={layout.label}>
          <Heading as="label" size="14px" textAlign="right">
            <Tooltip>{t("userAdminForm.id")}</Tooltip>
          </Heading>
        </Col>
        <Col xs={layout.input}>
          <Input
            style={{
              marginLeft: 10,
            }}
            value={external}
            onChange={({ target }) => setFieldValue("external", target.value)}
            maxLength={250}
          />
        </Col>
      </Box>

      <Box hasError={errors.active}>
        <Col xs={layout.label}>
          <Heading as="label" size="14px" textAlign="right">
            <Tooltip>{t("userAdminForm.active")}</Tooltip>
          </Heading>
        </Col>
        <Col xs={layout.input}>
          <Switch
            onChange={(active) => setFieldValue("active", active)}
            checked={active}
            style={{
              marginLeft: 10,
              marginRight: 5,
            }}
          />
        </Col>
      </Box>

      {(security.isAdmin() || security.isTraining()) && (
        <Box hasError={errors.roles}>
          <Col xs={layout.label}>
            <Heading as="label" size="14px" textAlign="right">
              <Tooltip>{t("userAdminForm.roles")}</Tooltip>
            </Heading>
          </Col>
          <Col xs={layout.input}>
            <Select
              id="reason"
              mode="multiple"
              optionFilterProp="children"
              style={{ width: "100%" }}
              value={roles}
              onChange={(roles) => setFieldValue("roles", roles)}
            >
              {Role.getRoles(t).map(({ id, label }) => (
                <Select.Option key={id} value={id}>
                  {label}
                </Select.Option>
              ))}
            </Select>
          </Col>
        </Box>
      )}
      {security.isAdmin() && id && (
        <Box hasError={errors.password}>
          <Col xs={layout.label}>
            {forcePassword && (
              <Heading
                as="label"
                size="14px"
                textAlign="right"
                style={{ color: "rgb(207, 19, 34)", fontWeight: 500 }}
              >
                <Tooltip>Senha inicial</Tooltip>
              </Heading>
            )}
          </Col>
          <Col xs={layout.input}>
            {forcePassword ? (
              <Input
                style={{
                  marginLeft: 10,
                  background: "rgba(255, 0, 0, 0.1)",
                }}
                value={password}
                onChange={({ target }) =>
                  setFieldValue("password", target.value)
                }
                maxLength={10}
              />
            ) : (
              <Button
                type="link"
                danger
                onClick={() => setForcePassword(true)}
                style={{ padding: 0 }}
              >
                Configurar senha inicial
              </Button>
            )}
          </Col>
        </Box>
      )}
    </>
  );
}
