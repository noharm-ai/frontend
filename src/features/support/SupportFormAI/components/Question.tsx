import { Divider } from "antd";
import { useTranslation } from "react-i18next";
import { Formik } from "formik";
import * as Yup from "yup";

import notification from "components/notification";
import Button from "components/Button";
import Editor from "components/Editor";
import { getErrorMessage } from "src/utils/errorHandler";
import { useAppDispatch } from "src/store";
import {
  setAIFormStep,
  setAIFormQuestion,
  setAIFormResponse,
  fetchN0Response,
  fetchN0Form,
} from "../../SupportSlice";

import { Form } from "styles/Form.style";
import { QuestionContainer } from "../SupportFormAI.style";

export function Question() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const askAgent = (params: any) => {
    dispatch(setAIFormQuestion(params.question));

    // @ts-expect-error ts 2554 (legacy code)
    dispatch(fetchN0Response(params)).then((response: any) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        const agent_response = response.payload.data.agent;
        if (agent_response.includes("SKIP_ANSWER")) {
          dispatch(setAIFormStep("form"));
        }
        dispatch(setAIFormResponse(agent_response));
      }
    });

    // @ts-expect-error ts 2554 (legacy code)
    dispatch(fetchN0Form(params)).then((response: any) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      }
    });

    dispatch(setAIFormStep("response"));
  };

  const validationSchema = Yup.object().shape({
    question: Yup.string().nullable().required(t("validation.requiredField")),
  });

  const initialValues = {
    question: "",
  };

  return (
    <Formik
      enableReinitialize
      onSubmit={askAgent}
      initialValues={initialValues}
      validationSchema={validationSchema}
    >
      {({ handleSubmit, errors, touched, values, setFieldValue }) => (
        <Form>
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
              Evite incluir mais de um chamado sobre o mesmo assunto, caso ainda
              esteja em aberto. Se tiver mais exemplos ou perguntas, envie no
              mesmo chamado.
            </p>
          </div>

          <Divider />

          <div
            className={`form-row ${
              errors.question && touched.question ? "error" : ""
            }`}
          >
            <QuestionContainer>
              <div className="form-label" style={{ marginBottom: "10px" }}>
                <label>Como podemos ajudar?</label>
              </div>
              <div className="form-input">
                <Editor
                  onEdit={(value: string) => setFieldValue("question", value)}
                  content={values.question || ""}
                />
              </div>
            </QuestionContainer>

            {errors.question && touched.question && (
              <div className="form-error">{errors.question}</div>
            )}
          </div>

          <div className="form-action-bottom">
            <Button
              type="primary"
              onClick={() => handleSubmit()}
              size="large"
              style={{ padding: "6px 50px" }}
            >
              Enviar
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
