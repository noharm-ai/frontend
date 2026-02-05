import { useEffect, useState } from "react";
import { Formik, FormikHelpers } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { Result, Descriptions, Modal } from "antd";
import { SyncOutlined, ExclamationCircleOutlined } from "@ant-design/icons";

import { useAppDispatch, useAppSelector } from "src/store";
import notification from "components/notification";
import DefaultModal from "components/Modal";
import { getErrorMessage } from "utils/errorHandler";
import {
  createSchema,
  fetchIntegrations,
  fetchTemplates,
} from "../IntegrationConfigSlice";
import { Base } from "./Base";

import { Form } from "styles/Form.style";

export interface ICreateSchemaForm {
  schema_name: string;
  create_user: boolean;
  db_user: string;
  tp_pep: string;
  template_id: string;
}

export interface ICreateSchemaFormProps {
  open: boolean;
  setOpen: (value: boolean) => void;
}

export function CreateSchemaForm({ open, setOpen }: ICreateSchemaFormProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const status = useAppSelector(
    (state) => state.admin.integrationConfig.createSchema.status,
  );
  const templateStatus = useAppSelector(
    (state) => state.admin.integrationConfig.templateList.status,
  );
  const [resultData, setResultData] = useState<any>(null);
  const isSaving = status === "loading" || templateStatus === "loading";

  const validationSchema = Yup.object().shape({
    schema_name: Yup.string()
      .nullable()
      .required(t("validation.requiredField")),
  });
  const initialValues = {
    schema_name: "",
    db_user: "",
    create_user: true,
    tp_pep: "",
    template_id: "",
  };

  const onSave = (
    params: ICreateSchemaForm,
    formikHelpers: FormikHelpers<ICreateSchemaForm>,
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

  const handleSaveWithConfirmation = (
    values: ICreateSchemaForm,
    formikHelpers: FormikHelpers<ICreateSchemaForm>,
  ) => {
    Modal.confirm({
      title: "Confirmar criação do schema",
      icon: <ExclamationCircleOutlined />,
      content: (
        <>
          Tem certeza que deseja criar o schema{" "}
          <strong>{values.schema_name}</strong>?
          {values.template_id ? (
            <p>
              O schema será criado com base no template{" "}
              <strong>{values.template_id}</strong>.
            </p>
          ) : (
            <p>O schema será criado sem template inicial.</p>
          )}
          <p></p>
        </>
      ),
      okText: "Sim, criar schema",
      cancelText: "Cancelar",
      onOk() {
        onSave(values, formikHelpers);
      },
    });
  };

  const onCancel = () => {
    setOpen(false);
    setResultData(null);
  };

  useEffect(() => {
    if (open) {
      dispatch(fetchTemplates());
    }
  }, [dispatch, open]);

  return (
    <Formik
      enableReinitialize
      onSubmit={handleSaveWithConfirmation}
      initialValues={initialValues}
      validationSchema={validationSchema}
    >
      {({ handleSubmit }: { handleSubmit: () => void }) => (
        <DefaultModal
          open={open}
          width={850}
          centered
          destroyOnHidden
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
                      <>
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

                          <Descriptions.Item label="ACCESS KEY ID:" span={3}>
                            {resultData.access_key_id
                              ? resultData.access_key_id
                              : "Não foi criado"}
                          </Descriptions.Item>
                          <Descriptions.Item
                            label="SECRET ACCESS KEY:"
                            span={3}
                          >
                            {resultData.secret_access_key
                              ? resultData.secret_access_key
                              : "Não foi criado"}
                          </Descriptions.Item>
                        </Descriptions>
                        {resultData.create_user && (
                          <p>
                            Lembre-se de salvar esta senha, pois ela não será
                            exibida novamente.
                          </p>
                        )}
                      </>
                    )}
                  </div>
                }
              ></Result>
            ) : (
              <>
                <Base />
                {templateStatus === "loading" && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <p>Carregando templates...</p>
                    <SyncOutlined spin />
                  </div>
                )}
              </>
            )}
          </Form>
        </DefaultModal>
      )}
    </Formik>
  );
}
