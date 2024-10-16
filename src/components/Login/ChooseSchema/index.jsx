import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Formik } from "formik";
import * as Yup from "yup";
import { Collapse } from "antd";

import { Select } from "components/Inputs";
import Switch from "components/Switch";
import DefaultModal from "components/Modal";
import { Form } from "styles/Form.style";
import Feature from "models/Feature";

function ChooseSchema({ preAuthConfig, doLogin, open, setOpen, isLogging }) {
  const { t } = useTranslation();
  const iptRef = useRef();

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
    extraFeatures: [],
  };

  const getExtraOptions = (values, setFieldValue) => [
    {
      key: "1",
      label: "Mais opções",
      children: (
        <>
          <div className={`form-row`}>
            <div className="form-label">
              <label>Extra Features:</label>
            </div>
            <div className="form-input">
              <Select
                onChange={(value) => {
                  setFieldValue("extraFeatures", value);
                }}
                value={values.extraFeatures}
                optionFilterProp="children"
                showSearch
                mode="multiple"
              >
                <Select.Option
                  key={Feature.DISABLE_CPOE}
                  value={Feature.DISABLE_CPOE}
                >
                  Desabilitar CPOE
                </Select.Option>
                {Feature.getFeatures(t).map((feature) => (
                  <Select.Option key={feature.id} value={feature.id}>
                    {feature.label}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>

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
        </>
      ),
    },
  ];

  const onSave = (params) => {
    const features = [...params.extraFeatures];
    if (!params.getname) {
      features.push("DISABLE_GETNAME");
    }

    doLogin({
      ...preAuthConfig.params,
      schema: params.schema,
      extraFeatures: features,
    });
    setOpen(false);
  };

  const onCancel = () => {
    setOpen(false);
  };

  const onChangeSchema = (schema, setFieldValue) => {
    setFieldValue("schema", schema);
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

            <Collapse
              ghost
              className="collapsed-content"
              items={getExtraOptions(values, setFieldValue, errors, touched)}
            />
          </Form>
        </DefaultModal>
      )}
    </Formik>
  );
}

export default ChooseSchema;
