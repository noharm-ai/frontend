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
          <strong>Olá! Seja bem-vindo(a) ao nosso suporte.</strong>
        </p>

        <p>
          Para que possamos resolver sua questão o mais rápido possível, por
          favor, descreva seu problema com o máximo de detalhes que conseguir.
        </p>

        <p>
          Nossa IA analisará sua mensagem para dar os primeiros passos e
          solicitar mais informações antes de abrir um chamado, caso necessário.
        </p>

        <p>
          <strong>Importante:</strong> Se você já tem um chamado aberto sobre
          este assunto, pedimos que envie as novas informações por lá. Isso
          centraliza o histórico e acelera muito a sua resposta!
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
