import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Formik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";

import notification from "components/notification";
import Heading from "components/Heading";
import DefaultModal from "components/Modal";
import { Form } from "styles/Form.style";
import { getErrorMessage } from "utils/errorHandler";
import { setExamsOrder } from "../ExamSlice";
import ExamsOrderBase from "./Base";

export default function ExamsOrder({ open, setOpen }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const status = useSelector((state) => state.admin.exam.setExamsOrder.status);

  const validationSchema = Yup.object().shape({
    idSegment: Yup.string().required(t("validation.requiredField")),
  });
  const initialValues = {
    idSegment: null,
    exams: {
      exam0: null,
      exam1: null,
      exam2: null,
      exam3: null,
      exam4: null,
      exam5: null,
      exam6: null,
      exam7: null,
      exam8: null,
      exam9: null,
      exam10: null,
      exam11: null,
      exam12: null,
      exam13: null,
      exam14: null,
      exam15: null,
      exam16: null,
      exam17: null,
      exam18: null,
      exam19: null,
    },
    open,
  };

  const onSave = (params) => {
    const payload = {
      idSegment: params.idSegment,
      exams: Object.values(params.exams).map((v) => v),
    };

    dispatch(setExamsOrder(payload)).then((response) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        setOpen(false);

        notification.success({
          message: "Card de exames atualizado!",
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
      {({ handleSubmit }) => (
        <DefaultModal
          open={open}
          width={900}
          centered
          destroyOnClose
          onCancel={onCancel}
          onOk={handleSubmit}
          okText={t("actions.save")}
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
            <Heading $margin="0 0 11px">Card de Exames</Heading>
          </header>

          <Form onSubmit={handleSubmit}>
            <p>
              Esta ação define os exames que serão exibidos na interface de
              prescrição.
            </p>

            <ExamsOrderBase />
          </Form>
        </DefaultModal>
      )}
    </Formik>
  );
}
