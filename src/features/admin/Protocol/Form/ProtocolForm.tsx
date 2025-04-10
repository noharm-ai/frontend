import { Formik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";

import { useAppDispatch, useAppSelector } from "src/store";
import DefaultModal from "components/Modal";
import { setProtocol } from "../ProtocolSlice";

import { Form } from "styles/Form.style";

import { BaseForm } from "./Base";

export interface IProtocolFormBaseFields {
  id?: string;
  name?: string;
  new?: boolean;
}

export function ProtocolForm() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const formData = useAppSelector((state) => state.admin.protocol.single.data);
  const status = useAppSelector((state) => state.admin.protocol.single.status);
  const isSaving = status === "loading";

  const validationSchema = Yup.object().shape({
    name: Yup.string().nullable().required(t("validation.requiredField")),
  });
  const initialValues = {
    ...formData,
  };

  const onSave = () => {
    // dispatch(upsertTag(params)).then((response) => {
    //   if (response.error) {
    //     notification.error({
    //       message: getErrorMessage(response, t),
    //     });
    //   } else {
    //     dispatch(setTag(null));
    //     notification.success({
    //       message: t("success.generic"),
    //     });
    //   }
    // });
  };

  const onCancel = () => {
    dispatch(setProtocol(null));
  };

  return (
    <Formik
      enableReinitialize
      onSubmit={onSave}
      initialValues={initialValues}
      validationSchema={validationSchema}
    >
      {({ handleSubmit }: { handleSubmit: () => void }) => (
        <DefaultModal
          open={formData}
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
            <h2 className="modal-title">Protocolo</h2>
          </header>

          <Form onSubmit={handleSubmit}>
            <BaseForm />
          </Form>
        </DefaultModal>
      )}
    </Formik>
  );
}
