import { useState } from "react";
import { Formik, FormikHelpers } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { Result } from "antd";

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
                  <>
                    {resultData.create_user && (
                      <>
                        <p>
                          Usuário: <strong>{resultData.db_user}</strong>
                          <br />
                          Senha: <strong>{resultData.db_password}</strong>
                          <br />
                        </p>
                        <p>
                          Lembre-se de registrar esta senha na documentação.
                        </p>
                      </>
                    )}
                  </>
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
