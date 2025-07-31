import DOMPurify from "dompurify";
import { Flex, Skeleton, Divider } from "antd";
import { motion } from "motion/react";

import { useAppSelector, useAppDispatch } from "src/store";
import {
  setAIFormStep,
  resetAIForm,
  createClosedTicket,
} from "../../SupportSlice";
import Button from "components/Button";

import {
  ChatContainer,
  ChatBubble,
  ActionSection,
  ActionText,
  ResponseContent,
} from "../SupportFormAI.style";

export function Response() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.support.aiform.askn0.status);
  const response = useAppSelector((state) => state.support.aiform.response);
  const question = useAppSelector((state) => state.support.aiform.question);
  const currentStep = useAppSelector(
    (state) => state.support.aiform.currentStep
  );

  const resolve = () => {
    closeTicket();

    dispatch(resetAIForm());
  };

  const openTicket = () => {
    dispatch(setAIFormStep(["question", "response", "form"]));
  };

  const closeTicket = () => {
    const description = `
    <h2>Pergunta do usuário</h2>

    ${question}

    <h2>Resposta do NZero</h2>
    ${response}
    `;

    // @ts-expect-error ts 2554 (legacy code)
    dispatch(createClosedTicket({ description }));
  };

  return (
    <ChatContainer>
      <ChatBubble>
        <motion.div
          initial={{ opacity: 0, transform: "translate3d(0, 10px, 0)" }}
          animate={{ opacity: 1, transform: "translate3d(0, 0, 0)" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          key={status}
        >
          {status === "loading" && (
            <Skeleton
              active
              paragraph={{ rows: 4 }}
              style={{ minWidth: "300px" }}
            />
          )}
          {status === "succeeded" && (
            <>
              <ResponseContent
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(response!, {
                    ADD_ATTR: ["target"],
                  }),
                }}
              />

              <Divider />

              <ActionSection>
                <ActionText>Você conseguiu resolver o problema?</ActionText>
              </ActionSection>
            </>
          )}
        </motion.div>

        {status === "failed" && <p>Nenhuma resposta disponível</p>}
      </ChatBubble>

      {status === "succeeded" && (
        <ChatBubble className="user">
          {currentStep.indexOf("form") !== -1 ? (
            <>Não, quero abrir um chamado</>
          ) : (
            <Flex justify="center" align="center">
              <Button type="primary" size="large" onClick={() => resolve()}>
                Sim, obrigado!
              </Button>
              <Button
                danger
                size="large"
                onClick={() => openTicket()}
                style={{ marginLeft: "10px" }}
              >
                Não, quero abrir um chamado
              </Button>
            </Flex>
          )}
        </ChatBubble>
      )}
    </ChatContainer>
  );
}
