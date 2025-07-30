import { useTranslation } from "react-i18next";
import { Formik } from "formik";
import { SendOutlined } from "@ant-design/icons";
import DOMPurify from "dompurify";
import * as Yup from "yup";

import notification from "components/notification";
import Button from "components/Button";
import Editor from "components/Editor";
import { getErrorMessage } from "src/utils/errorHandler";
import { useAppDispatch, useAppSelector } from "src/store";
import {
  setAIFormStep,
  setAIFormQuestion,
  setAIFormResponse,
  fetchN0Response,
  fetchN0Form,
} from "../../SupportSlice";

import { Form } from "styles/Form.style";
import {
  QuestionContainer,
  ChatContainer,
  ChatBubble,
  ResponseContent,
} from "../SupportFormAI.style";

export function Question() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const userQuestion = useAppSelector((state) => state.support.aiform.question);

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
          dispatch(setAIFormStep(["question", "form"]));
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

    dispatch(setAIFormStep(["question", "response"]));
  };

  const validationSchema = Yup.object().shape({
    question: Yup.string().nullable().required(t("validation.requiredField")),
  });

  const initialValues = {
    question: "",
  };

  return (
    <ChatContainer>
      <ChatBubble>
        <p>
          Prezado usuário, para garantir que possamos oferecer um suporte mais
          eficaz,{" "}
          <strong>
            é crucial que você forneça o máximo de detalhes possível sobre sua
            questão
          </strong>
          . Descreva a situação no campo “mensagem”, traga exemplos de
          atendimentos e/ou prescrições, e também anexe prints de tela ou
          documentos.
        </p>

        <p>
          Evite incluir mais de um chamado sobre o mesmo assunto, caso ainda
          esteja em aberto. Se tiver mais exemplos ou perguntas, envie no mesmo
          chamado.
        </p>

        <h3>Como podemos ajudar?</h3>
      </ChatBubble>

      <ChatBubble className={`user ${userQuestion ? "" : "form no-padding"}`}>
        {userQuestion ? (
          <ResponseContent
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(userQuestion!, {
                ADD_ATTR: ["target"],
              }),
            }}
          />
        ) : (
          <Formik
            enableReinitialize
            onSubmit={askAgent}
            initialValues={initialValues}
            validationSchema={validationSchema}
          >
            {({ handleSubmit, errors, touched, values, setFieldValue }) => (
              <Form>
                <div
                  className={`form-row ${
                    errors.question && touched.question ? "error" : ""
                  }`}
                >
                  <QuestionContainer>
                    <Editor
                      onEdit={(value: string) =>
                        setFieldValue("question", value)
                      }
                      content={values.question || ""}
                    />
                  </QuestionContainer>

                  {errors.question && touched.question && (
                    <div className="form-error">{errors.question}</div>
                  )}
                </div>

                <div
                  className="form-action"
                  style={{
                    marginTop: "20px",
                    borderTop: "1px solid #d9d9d9",
                    padding: "10px",
                  }}
                >
                  <Button
                    type="primary"
                    onClick={() => handleSubmit()}
                    size="large"
                    style={{ padding: "6px 50px" }}
                    icon={<SendOutlined />}
                  >
                    Enviar
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        )}
      </ChatBubble>
    </ChatContainer>
  );
}
