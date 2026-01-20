import { Formik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";

import { useAppDispatch, useAppSelector } from "src/store";
import DefaultModal from "components/Modal";
import notification from "components/notification";
import { getErrorMessage } from "src/utils/errorHandler";
import { setProtocol, upsertProtocol, fetchProtocols } from "../ProtocolSlice";
import { BaseForm } from "./Base";

import { Form } from "styles/Form.style";

export interface IProtocolFormBaseFields {
  id?: number;
  name?: string;
  protocolType?: number;
  statusType?: number;
  config: {
    variables?: any[];
    trigger?: string;
    result: {
      level: string;
      message: string;
      description: string;
    };
  };
  newProtocol?: boolean;
}

export function ProtocolForm() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const formData = useAppSelector((state) => state.admin.protocol.single.data);
  const status = useAppSelector((state) => state.admin.protocol.single.status);
  const isSaving = status === "loading";

  const validationSchema = Yup.object().shape({
    name: Yup.string().nullable().required(t("validation.requiredField")),
    protocolType: Yup.string()
      .nullable()
      .required(t("validation.requiredField")),
    statusType: Yup.string().nullable().required(t("validation.requiredField")),
    config: Yup.object().shape({
      variables: Yup.array()
        .nullable()
        .min(1, t("validation.atLeastOne"))
        .required(t("validation.requiredField")),
      trigger: Yup.string().nullable().required(t("validation.requiredField")),
      result: Yup.object().shape({
        level: Yup.string().nullable().required(t("validation.requiredField")),
        message: Yup.string()
          .nullable()
          .required(t("validation.requiredField")),
        description: Yup.string()
          .nullable()
          .required(t("validation.requiredField")),
      }),
    }),
  });
  const initialValues = {
    ...formData,
  };

  const onSave = (params: IProtocolFormBaseFields) => {
    delete params.newProtocol;

    dispatch(upsertProtocol(params)).then((response: any) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        dispatch(setProtocol(null));
        dispatch(fetchProtocols({}));
        notification.success({
          message: t("success.generic"),
        });
      }
    });
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
          width={600}
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
              {values.newProtocol ? "Novo Protocolo" : values.name}
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
