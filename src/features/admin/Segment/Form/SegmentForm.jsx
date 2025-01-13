import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Formik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";

import notification from "components/notification";
import Heading from "components/Heading";
import DefaultModal from "components/Modal";
import { getErrorMessage } from "utils/errorHandler";
import { Form } from "styles/Form.style";
import { fetchSegmentsListThunk } from "store/ducks/segments/thunk";

import { setSegment, upsertSegment } from "../SegmentSlice";
import Base from "./Base";

function SegmentForm({ open, setOpen }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const formData = useSelector((state) => state.admin.segment.single.data);
  const status = useSelector(
    (state) => state.admin.segment.upsertSegment.status
  );
  const isSaving = status === "loading";

  const validationSchema = Yup.object().shape({
    description: Yup.string()
      .nullable()
      .required(t("validation.requiredField")),
    type: Yup.number().nullable().required(t("validation.requiredField")),
  });
  const initialValues = {
    ...formData,
  };

  const onSave = (params) => {
    dispatch(upsertSegment(params)).then((response) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        dispatch(setSegment(null));
        dispatch(fetchSegmentsListThunk({ clearCache: true }));
        setOpen(false);

        notification.success({
          message: t("success.generic"),
        });
      }
    });
  };

  const onCancel = () => {
    dispatch(setSegment(null));
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
          width={500}
          centered
          destroyOnClose
          onCancel={onCancel}
          onOk={handleSubmit}
          okText={t("actions.save")}
          cancelText={t("actions.cancel")}
          confirmLoading={isSaving}
          okButtonProps={{
            disabled: isSaving,
          }}
          cancelButtonProps={{
            disabled: isSaving,
          }}
        >
          <header>
            <Heading margin="0 0 11px">Segmento</Heading>
          </header>

          <Form onSubmit={handleSubmit}>
            <Base />
          </Form>
        </DefaultModal>
      )}
    </Formik>
  );
}

export default SegmentForm;
