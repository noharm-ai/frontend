import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Formik } from "formik";
import * as Yup from "yup";
import { Rate } from "antd";

import DefaultModal from "components/Modal";
import { Textarea } from "components/Inputs";
import notification from "components/notification";
import Heading from "components/Heading";
import { getErrorMessage } from "utils/errorHandler";

import { Form } from "styles/Form.style";

import { saveDraft } from "features/memory/MemoryDraft/MemoryDraftSlice";
import { setSaveStatus } from "../SummarySlice";

function SummaryText({ open, setOpen, admissionNumber }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const blocks = useSelector((state) => state.summary.blocks);
  const validationSchema = Yup.object().shape({
    rate: Yup.string().nullable().required(t("validation.requiredField")),
  });
  const initialValues = {
    obs: null,
    rate: null,
  };

  const rates = ["Péssima", "Ruim", "Boa", "Muito Boa", "Excelente"];

  const save = (params) => {
    setLoading(true);
    const pageTimer = window.noharm?.pageTimer;

    dispatch(
      saveDraft({
        type: `summary_save_${admissionNumber}`,
        value: {
          admissionNumber,
          rate: params.rate,
          obs: params.obs,
          time: pageTimer?.getCurrentTime(),
          blocks,
        },
      })
    ).then((response) => {
      setLoading(false);

      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        notification.success({
          message: "Sumário finalizado com sucesso! Obrigado!",
        });

        pageTimer?.reset();
        setOpen(false);
        dispatch(setSaveStatus({ saveStatus: "saved" }));
      }
    });
  };

  return (
    <Formik
      enableReinitialize
      onSubmit={save}
      initialValues={initialValues}
      validationSchema={validationSchema}
    >
      {({ handleSubmit, values, setFieldValue, errors, touched }) => (
        <DefaultModal
          width={"500px"}
          centered
          destroyOnClose
          onOk={handleSubmit}
          onCancel={() => setOpen(false)}
          open={open}
          cancelText="Cancelar"
          okText="Finalizar"
          confirmLoading={loading}
        >
          <header>
            <Heading margin="0 0 11px">Finalizar Sumário</Heading>
          </header>
          <Form>
            <div
              className={`form-row ${
                errors.rate && touched.rate ? "error" : ""
              }`}
            >
              <div className="form-label">
                <label>Qual é a sua avaliação geral sobre o sumário:</label>
              </div>
              <div className="form-input">
                <Rate
                  tooltips={rates}
                  onChange={(value) => setFieldValue("rate", value)}
                  value={values.rate}
                />
                {values.rate ? (
                  <span className="ant-rate-text">
                    {rates[values.rate - 1]}
                  </span>
                ) : (
                  ""
                )}
              </div>
              {errors.rate && touched.rate && (
                <div className="form-error">{errors.rate}</div>
              )}
            </div>
            <div className={`form-row`}>
              <div className="form-label">
                <label>Observações:</label>
              </div>
              <div className="form-input">
                <Textarea
                  value={values.obs}
                  style={{ minHeight: "150px" }}
                  onChange={({ target }) => setFieldValue("obs", target.value)}
                ></Textarea>
              </div>
            </div>
          </Form>
        </DefaultModal>
      )}
    </Formik>
  );
}

export default SummaryText;
