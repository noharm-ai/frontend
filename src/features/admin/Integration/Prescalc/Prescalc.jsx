import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Formik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";

import notification from "components/notification";
import Heading from "components/Heading";
import DefaultModal from "components/Modal";
import { Select, InputNumber } from "components/Inputs";
import { Form } from "styles/Form.style";
import { getErrorMessage } from "utils/errorHandler";
import { prescalc } from "../IntegrationSlice";

function PrescalcModal({ open, setOpen }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const status = useSelector(
    (state) => state.admin.integration.prescalc.status
  );

  const validationSchema = Yup.object().shape({
    id: Yup.string().nullable().required(t("validation.requiredField")),
    cpoe: Yup.string().nullable().required(t("validation.requiredField")),
  });
  const initialValues = {
    id: null,
    cpoe: null,
    open,
  };

  const onSave = (params) => {
    dispatch(prescalc(params)).then((response) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        setOpen(false);

        notification.success({
          message: "Finalizado com sucesso!",
        });
      }
    });
  };

  const onCancel = () => {
    setOpen(false);
  };

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
          okText="Executar"
          cancelText={t("actions.cancel")}
          confirmLoading={status === "loading"}
          okButtonProps={{
            disabled: status === "loading",
          }}
          cancelButtonProps={{
            disabled: status === "loading",
          }}
        >
          <header>
            <Heading margin="0 0 11px">Prescalc</Heading>
          </header>

          <Form onSubmit={handleSubmit}>
            <p>
              O Prescalc é responsável por criar as prescrições agregadas e
              atualizar os indicadores da prescrição. Em casos normais, esta
              etapa é executada automaticamente.
            </p>
            <p>
              Utilize este recurso caso precise gerar manualmente a prescriçao
              agregada de um atendimento específico.
            </p>
            <div
              className={`form-row ${
                errors.cpoe && touched.cpoe ? "error" : ""
              }`}
            >
              <div className="form-label">
                <label>CPOE:</label>
              </div>
              <div className="form-input">
                <Select
                  onChange={(value) => {
                    setFieldValue("cpoe", value);
                    setFieldValue("id", null);
                  }}
                  value={values.cpoe}
                  status={errors.cpoe && touched.cpoe ? "error" : null}
                  optionFilterProp="children"
                  showSearch
                  autoFocus
                  allowClear
                >
                  <Select.Option key={0} value={false}>
                    Não
                  </Select.Option>
                  <Select.Option key={1} value={true}>
                    Sim
                  </Select.Option>
                </Select>
              </div>
              {errors.cpoe && touched.cpoe && (
                <div className="form-error">{errors.cpoe}</div>
              )}
            </div>

            {(values.cpoe === true || values.cpoe === false) && (
              <div
                className={`form-row ${errors.id && touched.id ? "error" : ""}`}
              >
                <div className="form-label">
                  <label>
                    {values.cpoe ? "Número do atendimento" : "ID da Prescrição"}
                    :
                  </label>
                </div>
                <div className="form-input">
                  <InputNumber
                    min={0}
                    value={values.id}
                    onChange={(value) => setFieldValue("id", value)}
                  />
                </div>
                {errors.id && touched.id && (
                  <div className="form-error">{errors.id}</div>
                )}
              </div>
            )}
          </Form>
        </DefaultModal>
      )}
    </Formik>
  );
}

export default PrescalcModal;
