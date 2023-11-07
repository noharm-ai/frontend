import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Formik } from "formik";
import * as Yup from "yup";

import { Select } from "components/Inputs";
import DefaultModal from "components/Modal";
import { Form } from "styles/Form.style";

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
  };

  const onSave = (params) => {
    doLogin({
      ...preAuthConfig.params,
      schema: params.schema,
      defaultRoles: params.defaultRoles,
    });
    setOpen(false);
  };

  const onCancel = () => {
    setOpen(false);
  };

  const onChangeSchema = (schema, setFieldValue) => {
    setFieldValue("schema", schema);
    const schemaConfig = preAuthConfig.schemas.find((i) => i.name === schema);

    if (schemaConfig.defaultRoles.length) {
      setDefaultRolesOptions(
        schemaConfig.defaultRoles.concat(schemaConfig.extraRoles || [])
      );
      setFieldValue("defaultRoles", schemaConfig.defaultRoles);
    } else {
      setDefaultRolesOptions([]);
      setFieldValue("defaultRoles", []);

      onSave({
        schema,
        defaultRoles: schemaConfig.defaultRoles,
      });
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
                          {role}
                        </Select.Option>
                      ))}
                  </Select>
                </div>
              </div>
            )}
          </Form>
        </DefaultModal>
      )}
    </Formik>
  );
}

export default ChooseSchema;
