import { Formik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";

import { useAppDispatch, useAppSelector } from "src/store";
import DefaultModal from "components/Modal";
import notification from "components/notification";
import { getErrorMessage } from "src/utils/errorHandler";
import {
  setGlobalExam,
  upsertGlobalExam,
  fetchGlobalExams,
} from "../GlobalExamSlice";
import { IGlobalExamFormBaseFields } from "../GlobalExamSlice";
import BaseForm from "./Base";

import { Form } from "styles/Form.style";

export function GlobalExamForm() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const formData = useAppSelector(
    (state) => state.admin.globalExam.single.data
  );
  const status = useAppSelector(
    (state) => state.admin.globalExam.single.status
  );
  const isSaving = status === "loading";

  const validationSchema = Yup.object().shape({
    name: Yup.string().nullable().required(t("validation.requiredField")),
    initials: Yup.string().nullable().required(t("validation.requiredField")),
    measureunit: Yup.string()
      .nullable()
      .required(t("validation.requiredField")),
    active: Yup.boolean().required(t("validation.requiredField")),
    min_adult: Yup.number().nullable().required(t("validation.requiredField")),
    max_adult: Yup.number().nullable().required(t("validation.requiredField")),
    ref_adult: Yup.string().nullable().required(t("validation.requiredField")),
    min_pediatric: Yup.number()
      .nullable()
      .required(t("validation.requiredField")),
    max_pediatric: Yup.number()
      .nullable()
      .required(t("validation.requiredField")),
    ref_pediatric: Yup.string()
      .nullable()
      .required(t("validation.requiredField")),
  });

  const initialValues = {
    tp_exam: "",
    name: "",
    initials: "",
    measureunit: "",
    active: true,
    min_adult: 0,
    max_adult: 0,
    ref_adult: "",
    min_pediatric: 0,
    max_pediatric: 0,
    ref_pediatric: "",
    ...formData,
  };

  const onSave = (params: IGlobalExamFormBaseFields) => {
    delete params.newGlobalExam;

    dispatch(upsertGlobalExam(params)).then((response: any) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        dispatch(setGlobalExam(null));
        dispatch(fetchGlobalExams({}));
        notification.success({
          message: t("success.generic"),
        });
      }
    });
  };

  const onCancel = () => {
    dispatch(setGlobalExam(null));
  };

  return (
    <Formik
      enableReinitialize
      onSubmit={onSave}
      initialValues={initialValues}
      validationSchema={validationSchema}
      validateOnChange={false}
      validateOnBlur={false}
    >
      {({
        handleSubmit,
        values,
      }: {
        handleSubmit: () => void;
        values: any;
      }) => (
        <DefaultModal
          open={!!formData}
          width={800}
          centered
          destroyOnHidden
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
          maskClosable={false}
        >
          <header>
            <h2 className="modal-title">
              {values.newGlobalExam
                ? "Novo Exame Global"
                : `Editar: ${values.name}`}
            </h2>
          </header>

          <Form onSubmit={handleSubmit}>
            <BaseForm />
          </Form>
        </DefaultModal>
      )}
    </Formik>
  );
}
