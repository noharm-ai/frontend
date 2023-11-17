import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Formik } from "formik";
import * as Yup from "yup";

import { Select } from "components/Inputs";
import Switch from "components/Switch";
import DefaultModal from "components/Modal";
import Tooltip from "components/Tooltip";
import { Form } from "styles/Form.style";
import Role from "models/Role";

function ChooseSchema({ preAuthConfig, doLogin, open, setOpen, isLogging }) {
  const { t } = useTranslation();
  const iptRef = useRef();
  const [defaultRolesOptions, setDefaultRolesOptions] = useState([]);

  useEffect(() => {
    if (open) {
      if (iptRef && iptRef.current) {
        setTimeout(() => {
          iptRef.current.focus();
        }, 50);
      }
    }
  }, [open]);

  const validationSchema = Yup.object().shape({
    schema: Yup.string().nullable().required(t("validation.requiredField")),
  });
  const initialValues = {
    schema: null,
    getname: false,
    runAsBasicUser: false,
  };

  const onSave = (params) => {
    const roles = [...params.defaultRoles];
    if (!params.getname) {
      roles.push("getname-disabled");
    }

    doLogin({
      ...preAuthConfig.params,
      schema: params.schema,
      defaultRoles: roles,
      runAsBasicUser: params.runAsBasicUser,
    });
    setOpen(false);
  };

  const onCancel = () => {
    setOpen(false);
  };

  const onChangeSchema = (schema, setFieldValue) => {
    setFieldValue("schema", schema);
    const schemaConfig = preAuthConfig.schemas.find((i) => i.name === schema);
    const extraRoles = Role.getLoginRoles(t).map((r) => r.id);

    if (schemaConfig.defaultRoles.length) {
      setDefaultRolesOptions(schemaConfig.defaultRoles.concat(extraRoles));
      setFieldValue("defaultRoles", schemaConfig.defaultRoles);
    } else {
      setDefaultRolesOptions(extraRoles);
      setFieldValue("defaultRoles", []);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <Formik
      enableReinitialize
      onSubmit={onSave}
      initialValues={initialValues}
      validationSchema={validationSchema}
    >
      {({ handleSubmit, errors, touched, values, setFieldValue }) => (
        <DefaultModal
          open={open}
          width={500}
          centered
          destroyOnClose
          onCancel={onCancel}
          onOk={handleSubmit}
          okText={t("login.login")}
          cancelText={t("actions.cancel")}
          confirmLoading={isLogging}
          okButtonProps={{
            disabled: isLogging,
          }}
          cancelButtonProps={{
            disabled: isLogging,
          }}
        >
          <Form onSubmit={handleSubmit}>
            <div
              className={`form-row ${
                errors.schema && touched.schema ? "error" : ""
              }`}
            >
              <div className="form-label">
                <label>Escolha o schema:</label>
              </div>
              <div className="form-input">
                <Select
                  onChange={(value) => {
                    onChangeSchema(value, setFieldValue);
                  }}
                  value={values.schema}
                  status={errors.schema && touched.schema ? "error" : null}
                  optionFilterProp="children"
                  showSearch
                  ref={iptRef}
                >
                  {preAuthConfig?.schemas &&
                    preAuthConfig.schemas.map(({ name }) => (
                      <Select.Option key={name} value={name}>
                        {name}
                      </Select.Option>
                    ))}
                </Select>
              </div>
              {errors.schema && touched.schema && (
                <div className="form-error">{errors.schema}</div>
              )}
            </div>

            {defaultRolesOptions.length > 0 && (
              <div className={`form-row`}>
                <div className="form-label">
                  <label>Roles:</label>
                </div>
                <div className="form-input">
                  <Select
                    onChange={(value) => {
                      setFieldValue("defaultRoles", value);
                    }}
                    value={values.defaultRoles}
                    optionFilterProp="children"
                    showSearch
                    mode="multiple"
                  >
                    {values.schema &&
                      defaultRolesOptions.map((role) => (
                        <Select.Option key={role} value={role}>
                          {t(`roles.${role}`)}
                        </Select.Option>
                      ))}
                  </Select>
                </div>
              </div>
            )}

            <div className={`form-row`}>
              <div className="form-label">
                <label>Ativar Getname:</label>
              </div>
              <div className="form-input">
                <Switch
                  onChange={(value) => {
                    setFieldValue("getname", value);
                  }}
                  checked={values.getname}
                />
              </div>
            </div>
            <div className={`form-row`}>
              <div className="form-label">
                <Tooltip
                  title="Remove as permissões especiais para simular a visão de um usuário normal da NoHarm"
                  underline
                >
                  <label>Simular Usuário Comum:</label>
                </Tooltip>
              </div>
              <div className="form-input">
                <Switch
                  onChange={(value) => {
                    setFieldValue("runAsBasicUser", value);
                  }}
                  checked={values.runAsBasicUser}
                />
              </div>
            </div>
          </Form>
        </DefaultModal>
      )}
    </Formik>
  );
}

export default ChooseSchema;
