import React, { useEffect } from "react";
import { Formik } from "formik";
import { useSelector, useDispatch } from "react-redux";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";

import notification from "components/notification";
import Heading from "components/Heading";
import DefaultModal from "components/Modal";
import LoadBox from "components/LoadBox";

import { fetchSubstanceClasses } from "features/lists/ListsSlice";
import Base from "./Base";
import { Form } from "styles/Form.style";

const saveMessage = {
  message: "Uhu! Substância salva com sucesso! :)",
};
const validationSchema = Yup.object().shape({
  sctid: Yup.number().required(),
  name: Yup.string().required(),
});

export default function Substance({
  saveStatus,
  save,
  fetchSubstance,
  afterSave,
  visible,
  ...props
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const substanceClasses = useSelector(
    (state) => state.lists.substanceClasses.list
  );
  const fetchStatus = useSelector(
    (state) => state.lists.substanceClasses.status
  );
  const { isSaving, isFetching, item } = saveStatus;

  useEffect(() => {
    if (item.sctid && visible) {
      fetchSubstance(item.sctid);
    }
  }, [item.sctid, fetchSubstance, visible]);

  useEffect(() => {
    if (fetchStatus === "idle" && substanceClasses.length === 0) {
      dispatch(fetchSubstanceClasses());
    }
  }, [fetchStatus, dispatch, substanceClasses]);

  if (fetchStatus === "failed") {
    notification.error({
      message: t("error.title"),
      description: t("error.description"),
    });
  }

  if (isFetching) {
    return <LoadBox />;
  }

  const initialValues = {
    ...item,
  };

  const submit = (params) => {
    save(params)
      .then(() => {
        notification.success(saveMessage);
        if (afterSave) {
          afterSave();
        }
      })
      .catch((err) => {
        console.err(err);
        notification.error({
          message: t("error.title"),
          description: t("error.description"),
        });
      });
  };

  return (
    <Formik
      enableReinitialize
      onSubmit={submit}
      initialValues={initialValues}
      validationSchema={validationSchema}
    >
      {({ handleSubmit }) => (
        <DefaultModal
          centered
          destroyOnClose
          open={visible}
          {...props}
          onOk={handleSubmit}
          confirmLoading={isSaving}
          okButtonProps={{
            disabled: isSaving,
          }}
          cancelButtonProps={{
            disabled: isSaving,
            className: "gtm-bt-cancel-edit-substance",
          }}
        >
          <header>
            <Heading margin="0 0 11px">Substância</Heading>
          </header>
          <Form onSubmit={handleSubmit}>
            <Base />
          </Form>
        </DefaultModal>
      )}
    </Formik>
  );
}
