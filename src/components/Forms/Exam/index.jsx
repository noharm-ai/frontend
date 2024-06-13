import React, { useEffect } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";

import { Row } from "components/Grid";
import notification from "components/notification";
import Heading from "components/Heading";
import DefaultModal from "components/Modal";
import { getErrorMessageFromException } from "utils/errorHandler";

import Base from "./Base";
import { FormContainer } from "../Form.style";

const saveMessage = {
  message: "Uhu! Exame salvo com sucesso! :)",
};
const validationSchema = Yup.object().shape({
  type: Yup.string().required(),
  name: Yup.string().required(),
  initials: Yup.string().required(),
  ref: Yup.string().required(),
  min: Yup.number().required(),
  max: Yup.number().required(),
});

export default function Exam({
  saveStatus,
  save,
  afterSave,
  fetchExamTypes,
  examTypes,
  examList,
  ...props
}) {
  const { t } = useTranslation();
  const { isSaving, item } = saveStatus;
  const { order, ...data } = item;

  const initialValues = {
    ...data,
  };

  useEffect(() => {
    fetchExamTypes();
  }, [fetchExamTypes]);

  const submit = (params) => {
    save(params)
      .then(() => {
        notification.success(saveMessage);
        if (afterSave) {
          afterSave();
        }
      })
      .catch((err) => {
        notification.error({
          message: t("error.title"),
          description: getErrorMessageFromException(err, t),
        });
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
          width={700}
          centered
          destroyOnClose
          {...props}
          onOk={handleSubmit}
          confirmLoading={isSaving}
          okButtonProps={{
            disabled: isSaving,
          }}
          cancelButtonProps={{
            disabled: isSaving,
            className: "gtm-bt-cancel-edit-exam",
          }}
        >
          <header>
            <Heading margin="0 0 11px">Exame</Heading>
          </header>
          <form onSubmit={handleSubmit}>
            <FormContainer>
              <Row type="flex" gutter={[16, 24]}>
                <Base examTypes={examTypes} examList={examList} />
              </Row>
            </FormContainer>
          </form>
        </DefaultModal>
      )}
    </Formik>
  );
}

Exam.defaultProps = {
  afterSave: () => {},
  initialValues: {
    type: "",
    name: "",
    active: true,
  },
};
