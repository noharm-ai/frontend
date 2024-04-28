import React, { useState } from "react";
import { useDispatch } from "react-redux";
import "styled-components/macro";
import { useFormikContext } from "formik";
import { Alert } from "antd";
import { useTranslation } from "react-i18next";

import { Col } from "components/Grid";
import Heading from "components/Heading";
import { Input } from "components/Inputs";
import Switch from "components/Switch";
import Tooltip from "components/Tooltip";
import { Select, Textarea } from "components/Inputs";
import Button from "components/Button";
import Role from "models/Role";
import DefaultModal from "components/Modal";
import notification from "components/notification";
import { getUserResetToken } from "features/serverActions/ServerActionsSlice";
import { getErrorMessage } from "utils/errorHandler";

import { Box } from "../Form.style";

export default function Base({ security }) {
  const dispatch = useDispatch();
  const [pwLoading, setPWLoading] = useState(false);
  const { values, setFieldValue, errors, touched } = useFormikContext();
  const { name, external, active, id, roles } = values;
  const layout = { label: 8, input: 16 };
  const { t } = useTranslation();

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    notification.success({ message: "Link copiado!" });
  };

  const generateResetToken = () => {
    setPWLoading(true);

    dispatch(getUserResetToken({ idUser: values.id })).then((response) => {
      setPWLoading(false);

      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        DefaultModal.info({
          title: "Link para Reset de Senha",
          content: (
            <>
              <p>
                Cuidado ao disponibilizar este link. Confira se o usuário é
                legítimo. Encaminhe este link somente para o email do usuário
                que irá utilizá-lo.
              </p>
              <Textarea
                onClick={() =>
                  copyToClipboard(
                    `${process.env.REACT_APP_URL}/reset/${response.payload.data}`
                  )
                }
                style={{ minHeight: "300px" }}
                value={`${process.env.REACT_APP_URL}/reset/${response.payload.data}`}
              ></Textarea>
            </>
          ),
          icon: null,
          width: 500,
          okText: "Fechar",
          okButtonProps: { type: "default" },
          wrapClassName: "default-modal",
        });
      }
    });
  };

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
          <Col xs={layout.label}></Col>
          <Col xs={layout.input}>
            <Button
              danger
              onClick={() => generateResetToken()}
              loading={pwLoading}
            >
              Gerar link para reset de senha
            </Button>
          </Col>
        </Box>
      )}
    </>
  );
}
