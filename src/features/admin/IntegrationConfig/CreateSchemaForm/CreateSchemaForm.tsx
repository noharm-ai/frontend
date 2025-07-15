import { useState } from "react";
import { Formik, FormikHelpers } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { Result, Descriptions } from "antd";

import { useAppDispatch, useAppSelector } from "src/store";
import notification from "components/notification";
import DefaultModal from "components/Modal";
import { getErrorMessage } from "utils/errorHandler";
import { createSchema, fetchIntegrations } from "../IntegrationConfigSlice";
import { Base } from "./Base";

import { Form } from "styles/Form.style";

export interface ICreateSchemaForm {
  schema: string;
  is_cpoe: boolean;
  is_pec: boolean;
  create_user: boolean;
  create_sqs: boolean;
  create_logstream: boolean;
  db_user: string;
}

export interface ICreateSchemaFormProps {
  open: boolean;
  setOpen: (value: boolean) => void;
}

export function CreateSchemaForm({ open, setOpen }: ICreateSchemaFormProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const status = useAppSelector(
    (state) => state.admin.integrationConfig.createSchema.status
  );
  const [resultData, setResultData] = useState<any>(null);
  const isSaving = status === "loading";

  const validationSchema = Yup.object().shape({
    schema: Yup.string().nullable().required(t("validation.requiredField")),
  });
  const initialValues = {
    schema: "",
    is_cpoe: false,
    is_pec: false,
    db_user: "",
    create_user: true,
    create_logstream: true,
    create_sqs: true,
  };

  const onSave = (
    params: ICreateSchemaForm,
    formikHelpers: FormikHelpers<ICreateSchemaForm>
  ) => {
    // @ts-expect-error ts 2554 (legacy code)
    dispatch(createSchema(params)).then((response: any) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        setResultData(response.payload.data.data);
        formikHelpers.resetForm();
        notification.success({
          message: t("success.generic"),
        });
        dispatch(fetchIntegrations());
      }
    });
  };

  const onCancel = () => {
    setOpen(false);
    setResultData(null);
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
            disabled: isSaving || resultData,
          }}
          cancelButtonProps={{
            disabled: isSaving,
          }}
          maskClosable={false}
        >
          <header>
            <h2 className="modal-title">Novo Schema</h2>
          </header>

          <Form onSubmit={handleSubmit}>
            {resultData ? (
              <Result
                status="success"
                title="Schema criado com sucesso!"
                subTitle={
                  <div style={{ marginTop: "25px" }}>
                    {resultData && (
                      <Descriptions bordered size="small">
                        <Descriptions.Item label="Usuário BD:" span={3}>
                          {resultData.db_user}
                        </Descriptions.Item>
                        <Descriptions.Item label="Senha BD:" span={3}>
                          {resultData.create_user
                            ? resultData.db_password
                            : "--"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Logstream:" span={3}>
                          {resultData.logstream_created
                            ? "Criado"
                            : "Não foi criado"}
                        </Descriptions.Item>
                        <Descriptions.Item label="SQS:" span={3}>
                          {resultData.sqs_queue_url
                            ? resultData.sqs_queue_url
                            : "Não foi criado"}
                        </Descriptions.Item>
                      </Descriptions>
                    )}
                  </div>
                }
              ></Result>
            ) : (
              <Base />
            )}
          </Form>
        </DefaultModal>
      )}
    </Formik>
  );
}
