import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { Formik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { Spin, Result } from "antd";

import notification from "components/notification";
import Button from "components/Button";
import DefaultModal from "components/Modal";
import { getErrorMessage } from "utils/errorHandler";
import { createTicket, setSupportOpen } from "../SupportSlice";
import Base from "./Base";

import { Form } from "styles/Form.style";

const MAX_FILE_SIZE = 2000000;

export default function SupportForm() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const status = useSelector((state) => state.support.form.status);

  const validationSchema = Yup.object().shape({
    category: Yup.string().nullable().required(t("validation.requiredField")),
    description: Yup.string()
      .nullable()
      .required(t("validation.requiredField")),
    attachment: Yup.mixed()
      .nullable()
      .test("is-valid-size", t("validation.max2mb"), (value) => {
        if (!value) return true;

        return value.size <= MAX_FILE_SIZE;
      }),
  });

  const initialValues = {
    category: null,
    description: null,
    fileList: [],
    attachment: null,
  };

  const goToSupportCenter = () => {
    dispatch(setSupportOpen(false));
    navigate("/suporte");
  };

  const onSave = (params, formikBag) => {
    const payload = {
      ...params,
      fromUrl: window.location.href,
    };
    delete payload.fileList;

    dispatch(createTicket(payload)).then((response) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });

        if (response.payload.statusCode >= 500) {
          DefaultModal.error({
            title: "Serviço Offline",
            content: (
              <>
                <p>
                  Nosso serviço de registro de chamados está fora do ar. Por
                  favor, encaminhe o seu pedido de ajuda para{" "}
                  <strong>{process.env.REACT_APP_SUPPORT_EMAIL}</strong>.
                </p>
              </>
            ),
            width: 500,
            okText: "Fechar",
            okButtonProps: { type: "default" },
            wrapClassName: "default-modal",
          });
        }
      } else {
        formikBag.resetForm();

        const modal = DefaultModal.success({
          content: null,
          icon: null,
          width: 500,
          okText: "Fechar",
          onOk: () => dispatch(setSupportOpen(false)),
          onCancel: () => dispatch(setSupportOpen(false)),
          okButtonProps: { type: "default" },
          wrapClassName: "default-modal",
        });

        modal.update({
          content: (
            <Result
              status="success"
              title="Ticket criado com sucesso"
              subTitle={
                <>
                  <p>
                    Sua solicitação foi recebida e está sendo revisada pelo
                    suporte.
                  </p>
                  <p>
                    A referência do seu ticket é{" "}
                    <strong>{response.payload.data[0]?.id}</strong>.
                  </p>
                  <p>
                    Você pode acompanhar o seu chamado pelo seu email ou atráves
                    da Central de Ajuda
                  </p>
                </>
              }
              extra={[
                <Button
                  type="primary"
                  onClick={() => {
                    goToSupportCenter();
                    modal.destroy();
                  }}
                  key={0}
                >
                  Central de Ajuda
                </Button>,
              ]}
            />
          ),
        });
      }
    });
  };

  return (
    <Formik
      enableReinitialize
      onSubmit={onSave}
      initialValues={initialValues}
      validationSchema={validationSchema}
    >
      {({ handleSubmit }) => (
        <Spin spinning={status === "loading"}>
          <Form onSubmit={handleSubmit}>
            <div className="form-intro">
              <p>
                Estamos aqui para ajudar a resolver suas dúvidas e problemas da
                melhor maneira possível. Para garantir que possamos oferecer o
                suporte mais eficaz, é crucial que você forneça o{" "}
                <strong>máximo de detalhes</strong> possível sobre sua questão.
              </p>

              <p>
                Quanto mais informações nos fornecer, mais precisamente
                poderemos entender sua situação e oferecer uma solução adequada.
                Detalhes específicos nos ajudam a agir de forma mais rápida e
                precisa, minimizando o tempo necessário para resolver o
                problema.
              </p>
            </div>

            <Base />

            <div className="form-action-bottom">
              <Button
                type="primary"
                onClick={handleSubmit}
                size="large"
                loading={status === "loading"}
              >
                Enviar
              </Button>
            </div>
          </Form>
        </Spin>
      )}
    </Formik>
  );
}
