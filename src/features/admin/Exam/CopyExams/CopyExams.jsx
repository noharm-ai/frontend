import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Formik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";

import notification from "components/notification";
import Heading from "components/Heading";
import DefaultModal from "components/Modal";
import { Select } from "components/Inputs";
import { Form } from "styles/Form.style";
import { getErrorMessage } from "utils/errorHandler";

import { copyExams } from "../ExamSlice";

function CopyExamsModal({ open, setOpen, ...props }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const status = useSelector((state) => state.admin.exam.copyExams.status);
  const segmentList = useSelector((state) => state.segments.list);

  const validationSchema = Yup.object().shape({
    idSegmentOrigin: Yup.string()
      .nullable()
      .required(t("validation.requiredField")),
    idSegmentDestiny: Yup.string()
      .nullable()
      .required(t("validation.requiredField")),
  });
  const initialValues = {
    idSegmentOrigin: null,
    idSegmentDestiny: null,
  };

  const onSave = (params) => {
    dispatch(copyExams(params)).then((response) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        setOpen(false);

        notification.success({
          message: "Exames copiados!",
          description: `${response.payload.data.data} exames inseridos`,
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
          destroyOnHidden
          onCancel={onCancel}
          onOk={handleSubmit}
          okText="Iniciar cópia"
          cancelText={t("actions.cancel")}
          confirmLoading={status === "loading"}
          okButtonProps={{
            disabled: status === "loading",
          }}
          cancelButtonProps={{
            disabled: status === "loading",
          }}
          {...props}
        >
          <header>
            <Heading $margin="0 0 11px">Copiar Exames</Heading>
          </header>

          <Form onSubmit={handleSubmit}>
            <p>
              Esta ação copia a configuração de exames entre o segmento{" "}
              <strong>origem</strong> e o segmento <strong>destino</strong>.
            </p>
            <p>
              Caso o destino já possua exames configurados, serão apenas
              acrescentados os novos exames que existirem na origem.
            </p>
            <div
              className={`form-row ${
                errors.idSegmentOrigin && touched.idSegmentOrigin ? "error" : ""
              }`}
            >
              <div className="form-label">
                <label>Segmento origem:</label>
              </div>
              <div className="form-input">
                <Select
                  onChange={(value) => setFieldValue("idSegmentOrigin", value)}
                  value={values.idSegmentOrigin}
                  status={
                    errors.idSegmentOrigin && touched.idSegmentOrigin
                      ? "error"
                      : null
                  }
                  optionFilterProp="children"
                  showSearch
                  autoFocus
                  allowClear
                >
                  {segmentList.map(({ id, description: text }) => (
                    <Select.Option key={id} value={id}>
                      {text}
                    </Select.Option>
                  ))}
                </Select>
              </div>
              {errors.idSegmentOrigin && touched.idSegmentOrigin && (
                <div className="form-error">{errors.idSegmentOrigin}</div>
              )}
            </div>

            <div
              className={`form-row ${
                errors.idSegmentOrigin && touched.idSegmentOrigin ? "error" : ""
              }`}
            >
              <div className="form-label">
                <label>Segmento destino:</label>
              </div>
              <div className="form-input">
                <Select
                  onChange={(value) => setFieldValue("idSegmentDestiny", value)}
                  value={values.idSegmentDestiny}
                  status={
                    errors.idSegmentDestiny && touched.idSegmentDestiny
                      ? "error"
                      : null
                  }
                  optionFilterProp="children"
                  showSearch
                  autoFocus
                  allowClear
                >
                  {segmentList.map(({ id, description: text }) => (
                    <Select.Option key={id} value={id}>
                      {text}
                    </Select.Option>
                  ))}
                </Select>
              </div>
              {errors.idSegmentDestiny && touched.idSegmentDestiny && (
                <div className="form-error">{errors.idSegmentDestiny}</div>
              )}
            </div>
          </Form>
        </DefaultModal>
      )}
    </Formik>
  );
}

export default CopyExamsModal;
