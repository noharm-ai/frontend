import DOMPurify from "dompurify";
import { Flex, Skeleton, Divider } from "antd";

import { useAppSelector, useAppDispatch } from "src/store";
import { setAIFormStep, resetAIForm } from "../../SupportSlice";
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

  const resolve = () => {
    dispatch(resetAIForm());
  };

  const openTicket = () => {
    dispatch(setAIFormStep("form"));
  };

  return (
    <ChatContainer>
      <ChatBubble>
        {status === "loading" && <Skeleton active paragraph={{ rows: 4 }} />}
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
            </ActionSection>
          </>
        )}
      </ChatBubble>

      {status === "failed" && <p>Nenhuma resposta disponível</p>}
    </ChatContainer>
  );
}
