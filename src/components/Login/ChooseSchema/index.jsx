import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Formik } from "formik";
import * as Yup from "yup";

import { Select } from "components/Inputs";
import DefaultModal from "components/Modal";
import { Form } from "styles/Form.style";

function ChooseSchema({ preAuthConfig, doLogin, open, setOpen, isLogging }) {
  const { t } = useTranslation();
  const iptRef = useRef();

  useEffect(() => {
    if (open) {
      console.log("ref", iptRef);
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
    });
    setOpen(false);
  };

  const onCancel = () => {
    setOpen(false);
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
                    setFieldValue("schema", value);
                    setTimeout(() => {
                      handleSubmit();
                    }, 50);
                  }}
                  value={values.schema}
                  status={errors.schema && touched.schema ? "error" : null}
                  optionFilterProp="children"
                  showSearch
                  ref={iptRef}
                >
                  {preAuthConfig?.schemas &&
                    preAuthConfig.schemas.map((item) => (
                      <Select.Option key={item} value={item}>
                        {item}
                      </Select.Option>
                    ))}
                </Select>
              </div>
              {errors.schema && touched.schema && (
                <div className="form-error">{errors.schema}</div>
              )}
            </div>
          </Form>
        </DefaultModal>
      )}
    </Formik>
  );
}

export default ChooseSchema;
