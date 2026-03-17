import { Formik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";

import { useAppDispatch, useAppSelector } from "src/store";
import DefaultModal from "components/Modal";
import notification from "components/notification";
import { getErrorMessage } from "src/utils/errorHandler";
import {
  setKnowledgeBase,
  upsertKnowledgeBase,
  fetchKnowledgeBases,
} from "../KnowledgeBaseSlice";
import { BaseForm } from "./Base";

import { Form } from "styles/Form.style";

export interface IKnowledgeBaseFormBaseFields {
  id?: number;
  path?: string[];
  link?: string;
  title?: string;
  description?: string;
  active?: boolean;
  newKnowledgeBase?: boolean;
}

export function KnowledgeBaseForm() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const formData = useAppSelector(
    (state) => state.admin.knowledgeBase.single.data
  );
  const status = useAppSelector(
    (state) => state.admin.knowledgeBase.single.status
  );
  const isSaving = status === "loading";

  const validationSchema = Yup.object().shape({
    title: Yup.string()
      .nullable()
      .max(250, t("validation.maxLength", { max: 250 }))
      .required(t("validation.requiredField")),
    path: Yup.array()
      .of(Yup.string())
      .min(1, t("validation.requiredField"))
      .required(t("validation.requiredField")),
    link: Yup.string()
      .nullable()
      .max(500, t("validation.maxLength", { max: 500 }))
      .required(t("validation.requiredField")),
    description: Yup.string()
      .nullable()
      .max(500, t("validation.maxLength", { max: 500 })),
    active: Yup.boolean().nullable().required(t("validation.requiredField")),
  });

  const initialValues = {
    ...formData,
  };

  const onSave = (params: IKnowledgeBaseFormBaseFields) => {
    delete params.newKnowledgeBase;

    dispatch(upsertKnowledgeBase(params)).then((response: any) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        dispatch(setKnowledgeBase(null));
        dispatch(fetchKnowledgeBases({}));
        notification.success({
          message: t("success.generic"),
        });
      }
    });
  };

  const onCancel = () => {
    dispatch(setKnowledgeBase(null));
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
          open={formData}
          width={700}
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
              {values.newKnowledgeBase ? "Novo Registro" : values.title}
            </h2>
          </header>

          <Form onSubmit={handleSubmit}>
            <BaseForm formData={formData} />
          </Form>
        </DefaultModal>
      )}
    </Formik>
  );
}
