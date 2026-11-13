import React, { useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { Formik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { Spin, Result, Divider } from "antd";

import Button from "components/Button";
import DefaultModal from "components/Modal";
import { createTicket, setSupportOpen, resetAIForm } from "../SupportSlice";
import { useTicketCreationBlock } from "../useTicketCreationBlock";
import { handlePendingTrainingError } from "../pendingTrainingError";
import { attachmentListSchema } from "../attachmentLimits";
import { showTicketSendError } from "../ticketSendError";
import Base from "./Base";

import { Form } from "styles/Form.style";

export default function SupportForm() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const status = useSelector((state) => state.support.form.status);
  const { requiresUrgent } = useTicketCreationBlock();
  // set synchronously, so a second submit in the same tick (double click,
  // Enter while the button re-renders) is dropped before it dispatches
  const submittingRef = useRef(false);

  const validationSchema = Yup.object().shape({
    // pending mandatory training: an ADMIN_SUPPORT holder must confirm urgency
    urgent: requiresUrgent
      ? Yup.boolean().oneOf(
          [true],
          "Confirme que o chamado é urgente para abrir com treinamento pendente",
        )
      : Yup.boolean().nullable(),
    title: Yup.string().nullable().required(t("validation.requiredField")),
    category: Yup.number().nullable().required(t("validation.requiredField")),
    description: Yup.string()
      .nullable()
      .required(t("validation.requiredField")),
    fileList: attachmentListSchema(t, "fileList"),
  });

  const initialValues = {
    title: null,
    category: null,
    description: null,
    fileList: [],
    admissionNumberExamples: null,
    prescriptionNumberExamples: null,
    urgent: false,
  };

  const goToSupportCenter = () => {
    dispatch(setSupportOpen(false));
    navigate("/suporte");
  };

  const goToTraining = () => {
    dispatch(setSupportOpen(false));
    navigate("/treinamento");
  };

  const onSave = (params, formikBag) => {
    if (submittingRef.current) return;
    submittingRef.current = true;

    const payload = {
      ...params,
      fromUrl: window.location.href,
    };

    let evidences = "";
    if (params.admissionNumberExamples) {
      evidences += `Números de atendimento: ${params.admissionNumberExamples}<br/>`;
    }

    if (params.prescriptionNumberExamples) {
      evidences += `Números de prescrição: ${params.prescriptionNumberExamples}<br/>`;
    }

    if (evidences !== "") {
      payload.description += `<hr/><br/<br/><h4>Exemplos:</h4> ${evidences}`;
    }

    return dispatch(createTicket(payload)).then((response) => {
      submittingRef.current = false;

      if (response.error) {
        if (handlePendingTrainingError(response, goToTraining)) {
          return;
        }

        showTicketSendError(response, t);
      } else {
        formikBag.resetForm();
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
            <div className="form-intro" style={{ fontSize: "15px" }}>
              <p>
                Prezado usuário, para garantir que possamos oferecer um suporte
                mais eficaz,{" "}
                <strong>
                  é crucial que você forneça o máximo de detalhes possível sobre
                  sua questão
                </strong>
                . Descreva a situação no campo “mensagem”, traga exemplos de
                atendimentos e/ou prescrições, e também anexe prints de tela ou
                documentos.
              </p>

              <p>
                Evite incluir mais de um chamado sobre o mesmo assunto, caso
                ainda esteja em aberto. Se tiver mais exemplos ou perguntas,
                envie no mesmo chamado.
              </p>
            </div>

            <Divider />

            <Base />

            <div className="form-action-bottom">
              <Button
                type="primary"
                onClick={handleSubmit}
                size="large"
                loading={status === "loading"}
                disabled={status === "loading"}
                style={{ padding: "6px 50px" }}
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
