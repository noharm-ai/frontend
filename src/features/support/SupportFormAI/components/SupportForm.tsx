import { useState } from "react";
import { Skeleton, Space, Result, Popconfirm } from "antd";
import { Formik } from "formik";
import { SendOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";

import { useAppSelector, useAppDispatch } from "src/store";
import Button from "src/components/Button";
import notification from "components/notification";
import DefaultModal from "components/Modal";
import { getErrorMessage } from "src/utils/errorHandler";
import { SupportField } from "./SupportField";
import {
  resetAIForm,
  createTicket,
  setSupportOpen,
  addAttachment,
} from "../../SupportSlice";
import SupportFormLegacy from "../../SupportForm/SupportForm";

import { Form } from "src/styles/Form.style";
import { ChatContainer, ChatBubble } from "../SupportFormAI.style";

const MAX_FILE_SIZE = 2000000;

export function SupportForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.support.aiform.n0form.status);
  const data: any = useAppSelector((state) => state.support.aiform.n0form.data);
  const question = useAppSelector((state) => state.support.aiform.question);
  const aiResponse = useAppSelector((state) => state.support.aiform.response);
  const [loading, setLoading] = useState<boolean>(false);

  const goToSupportCenter = () => {
    dispatch(setSupportOpen(false));
    navigate("/suporte");
  };

  const sendTicket = async (params: any) => {
    setLoading(true);

    const payload: any = {
      category: data.type,
      title: data.subject,
      fromUrl: window.location.href,
    };

    const attachmentPayload: any = {};

    const extraInfo: string[] = [];
    data.extra_fields.forEach((field: any) => {
      if (field.type !== "archive") {
        extraInfo.push(
          `<strong>${field.label}</strong>: <br/>${params[field.label]}`
        );
      } else {
        attachmentPayload[field.label] = params[field.label];
      }
    });

    payload.description = `
    <h2>Mensagem Original</h2>
    ${question}

    <hr/>

    <h2>Resumo</h2>
    ${data.description}

    <hr/>

    <h2>Informações complementares</h2>
    ${extraInfo.join("<br><br/>")}

    <hr/>

    <h2>Resposta N0</h2>
    ${aiResponse}
    `;

    // @ts-expect-error ts 2554 (legacy code)
    const response: any = await dispatch(createTicket(payload));

    if (response.error) {
      setLoading(false);
      notification.error({
        message: getErrorMessage(response, t),
      });

      if (response?.payload?.statusCode >= 500) {
        DefaultModal.error({
          title: "Serviço Offline",
          content: (
            <>
              <p>
                Nosso serviço de registro de chamados está fora do ar. Por
                favor, encaminhe o seu pedido de ajuda para{" "}
                <strong>{import.meta.env.VITE_APP_SUPPORT_EMAIL}</strong>.
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
      data.extra_fields.forEach(async (field: any) => {
        if (field.type === "archive") {
          const attachmentPayload = {
            id_ticket: response.payload.data[0]?.id,
            [field.label]: params[field.label],
          };

          // @ts-expect-error ts 2554 (legacy code)
          await dispatch(addAttachment(attachmentPayload));
        }
      });

      setLoading(false);

      dispatch(resetAIForm());
      const modal = DefaultModal.success({
        content: null,
        icon: null,
        width: 600,
        okText: "Fechar",
        onOk: () => dispatch(setSupportOpen(false)),
        onCancel: () => dispatch(setSupportOpen(false)),
        okButtonProps: { type: "default" },
        wrapClassName: "default-modal",
      });

      const link = `${import.meta.env.VITE_APP_ODOO_LINK}my/ticket/${
        response.payload.data[0]?.id
      }?access_token=${response.payload.data[0]?.access_token}`;

      modal.update({
        content: (
          <Result
            status="success"
            title="Chamado criado com sucesso"
            subTitle={
              <div style={{ color: "rgba(0, 0, 0, 0.7)" }}>
                <p>
                  A referência do seu chamado é{" "}
                  <strong>{response.payload.data[0]?.ticket_ref}</strong>.
                </p>
                <p>
                  Você pode acompanhar o chamado pelo seu email ou atráves da
                  Central de Ajuda
                </p>
                <p>
                  Fique atento no andamento do seu chamado e nas respostas dos
                  nossos agentes, e, se possível, responda o quanto antes.{" "}
                  <strong>
                    Chamados sem resposta por 5 dias, serão cancelados
                    automaticamente
                  </strong>
                  .
                </p>
              </div>
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
              <Button
                type="primary"
                onClick={() => {
                  window.open(link, "_blank");
                }}
                key={1}
              >
                Visualizar Chamado
              </Button>,
            ]}
          />
        ),
      });
    }
  };

  const cancel = () => {
    dispatch(resetAIForm());
  };

  const initialValues: any = {};
  const validationSchemaShape: any = {};
  if (data && data.extra_fields) {
    data.extra_fields.forEach((field: any) => {
      initialValues[field.label] = "";

      if (field.type === "archive") {
        validationSchemaShape[field.label] = Yup.array().of(
          Yup.mixed()
            .nullable()
            .test("is-valid-size", function (value) {
              if (!value) return true;

              return value.size <= MAX_FILE_SIZE
                ? true
                : this.createError({
                    message: `${value.name}: ${t("validation.max2mb")}`,
                    path: field.label,
                  });
            })
        );
      }
    });
  }

  if (status === "loading") {
    return (
      <ChatContainer>
        <ChatBubble>
          <Skeleton
            active
            paragraph={{ rows: 4 }}
            style={{ minWidth: "300px" }}
          />
        </ChatBubble>
      </ChatContainer>
    );
  }

  return (
    <div>
      {status === "succeeded" && (
        <ChatContainer>
          <ChatBubble>
            <h3 style={{ color: "#2e3c5a" }}>
              Por favor, forneça mais algumas informações:
            </h3>
            <Formik
              enableReinitialize
              onSubmit={sendTicket}
              initialValues={initialValues}
              validationSchema={Yup.object().shape(validationSchemaShape)}
            >
              {({ handleSubmit, errors, touched, values, setFieldValue }) => (
                <Form>
                  <div className="form-intro" style={{ fontSize: "15px" }}>
                    <p>
                      Preencha os campos abaixo para abrir um chamado. Quanto
                      mais informações você fornecer, melhor poderemos te
                      ajudar.
                    </p>
                  </div>

                  {data.extra_fields &&
                    data.extra_fields.map((field: any) => (
                      <div
                        key={field.label}
                        className={`form-row ${
                          errors[field.label] && touched[field.label]
                            ? "error"
                            : ""
                        }`}
                      >
                        <div className="form-label">
                          <label>{field.label}:</label>
                        </div>
                        <div className="form-input">
                          <SupportField
                            label={field.label}
                            type={field.type}
                            setFieldValue={setFieldValue}
                            value={values[field.label]}
                            error={errors[field.label]}
                          />
                        </div>
                      </div>
                    ))}

                  <div className={`form-row`}>
                    <div className="form-action-bottom">
                      <Space>
                        <Popconfirm
                          title="Cancelar chamado"
                          description="Confirma o cancelamento da abertura do chamado?"
                          okText="Sim"
                          cancelText="Não"
                          onConfirm={() => cancel()}
                          zIndex={9999}
                        >
                          <Button>Cancelar</Button>
                        </Popconfirm>
                        <Button
                          type="primary"
                          onClick={() => handleSubmit()}
                          icon={<SendOutlined />}
                          loading={loading}
                          size="large"
                        >
                          Abrir chamado
                        </Button>
                      </Space>
                    </div>
                  </div>
                </Form>
              )}
            </Formik>
          </ChatBubble>
        </ChatContainer>
      )}

      {status === "failed" && <SupportFormLegacy />}
    </div>
  );
}
