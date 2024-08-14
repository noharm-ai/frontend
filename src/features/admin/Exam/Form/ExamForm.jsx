import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Formik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";

import notification from "components/notification";
import Heading from "components/Heading";
import DefaultModal from "components/Modal";
import { getErrorMessage } from "utils/errorHandler";
import { selectExam, upsertExam } from "../ExamSlice";

import Base from "./Base";
import { Form } from "styles/Form.style";

export default function ExamForm() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const data = useSelector((state) => state.admin.exam.single.data);
  const status = useSelector((state) => state.admin.exam.single.status);

  const validationSchema = Yup.object().shape({
    idSegment: Yup.string().required(t("validation.requiredField")),
    type: Yup.string().required(t("validation.requiredField")),
    name: Yup.string().required(t("validation.requiredField")),
    initials: Yup.string().required(t("validation.requiredField")),
    ref: Yup.string().required(t("validation.requiredField")),
    min: Yup.number().required(t("validation.requiredField")),
    max: Yup.number().required(t("validation.requiredField")),
  });

  const initialValues = {
    ...data,
  };

  const submit = (params) => {
    dispatch(upsertExam(params)).then((response) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        dispatch(selectExam(null));

        notification.success({
          message: t("success.generic"),
        });
      }
    });
  };

  return (
    <Formik
      submit
      onSubmit={submit}
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize={true}
    >
      {({ handleSubmit }) => (
        <DefaultModal
          open={data}
          width={700}
          centered
          destroyOnClose
          onOk={handleSubmit}
          onCancel={() => dispatch(selectExam(null))}
          confirmLoading={status === "loading"}
          okButtonProps={{
            disabled: status === "loading",
          }}
          cancelButtonProps={{
            disabled: status === "loading",
          }}
        >
          <header>
            <Heading margin="0 0 11px">Exame</Heading>
          </header>

          <Form>
            <Base />
          </Form>
        </DefaultModal>
      )}
    </Formik>
  );
}
