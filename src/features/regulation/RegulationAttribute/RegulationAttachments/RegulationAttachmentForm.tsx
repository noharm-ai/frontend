import { useState } from "react";
import { Formik, FormikHelpers } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";

import { useAppDispatch } from "src/store";
import DefaultModal from "components/Modal";
import notification from "components/notification";
import { Input } from "components/Inputs";
import { createAttribute } from "../RegulationAttributeSlice";
import { Form } from "styles/Form.style";
import { getErrorMessage } from "utils/errorHandler";
import { RegulationAttributeType } from "src/models/regulation/RegulationAttributeType";

interface IRegulationAttachmentProps {
  open: boolean;
  close: () => void;
  idRegSolicitation: number;
}

interface IRegulationAttachmentForm {
  idRegSolicitation: number;
  name: string;
  link: string;
}

export function RegulationAttachmentForm({
  open,
  close,
  idRegSolicitation,
}: IRegulationAttachmentProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState<boolean>(false);

  const validationSchema = Yup.object().shape({
    name: Yup.string().required(t("validation.requiredField")),
    link: Yup.string()
      .url("Link inválido")
      .matches(/^https:\/\//, "O link precisa começar com https://")
      .required("Campo obrigatório"),
    idRegSolicitation: Yup.number().required(t("validation.requiredField")),
  });
  const initialValues: IRegulationAttachmentForm = {
    idRegSolicitation,
    name: "",
    link: "",
  };

  const onSave = (
    params: IRegulationAttachmentForm,
    formikHelpers: FormikHelpers<IRegulationAttachmentForm>
  ) => {
    setLoading(true);
    const payload = {
      idRegSolicitation: params.idRegSolicitation,
      tpAttribute: RegulationAttributeType.ATTACHMENT,
      tpStatus: 1,
      value: {
        name: params.name,
        link: params.link,
      },
    };

    dispatch(createAttribute(payload)).then((response: any) => {
      setLoading(false);

      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        formikHelpers.resetForm();
        close();
      }
    });
  };

  const onCancel = () => {
    close();
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
      {({ handleSubmit, errors, values, setFieldValue }) => (
        <DefaultModal
          open={open}
          width={500}
          centered
          destroyOnClose
          onCancel={onCancel}
          onOk={() => handleSubmit()}
          okText={t("actions.save")}
          cancelText={t("actions.cancel")}
          confirmLoading={loading}
          okButtonProps={{
            disabled: loading,
          }}
          cancelButtonProps={{
            disabled: loading,
          }}
          maskClosable={false}
        >
          <h2 className="modal-title">Criar Anexo</h2>

          <Form onSubmit={handleSubmit}>
            <div className={`form-row ${errors.name ? "error" : ""}`}>
              <div className="form-label">
                <label>Descrição:</label>
              </div>
              <div className="form-input">
                <Input
                  value={values.name}
                  onChange={({ target }) => setFieldValue("name", target.value)}
                  maxLength={300}
                />
              </div>
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>

            <div className={`form-row ${errors.link ? "error" : ""}`}>
              <div className="form-label">
                <label>Link:</label>
              </div>
              <div className="form-input">
                <Input
                  value={values.link}
                  onChange={({ target }) => setFieldValue("link", target.value)}
                  maxLength={400}
                />
              </div>
              {errors.link && <div className="form-error">{errors.link}</div>}
            </div>
          </Form>
        </DefaultModal>
      )}
    </Formik>
  );
}
