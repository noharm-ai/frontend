import DOMPurify from "dompurify";
import { Flex, Skeleton, Divider } from "antd";

import { useAppSelector, useAppDispatch } from "src/store";
import { setAIFormStep, resetAIForm } from "../../SupportSlice";
import Button from "components/Button";
import Avatar from "components/Avatar";

import {
  ChatHeader,
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
    <div>
      <div>
        <ChatHeader>
          <Avatar
            size={60}
            src="/imgs/n0-pharma.png"
            style={{
              flexShrink: 0,
              border: "2px solid #FF8845",
            }}
          />
          <h2>Suporte NoHarm</h2>
        </ChatHeader>
        <ChatContainer>
          <ChatBubble>
            {status === "loading" && (
              <Skeleton active paragraph={{ rows: 4 }} />
            )}
            {status === "succeeded" && (
              <ResponseContent
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(response!, {
                    ADD_ATTR: ["target"],
                  }),
                }}
              />
            )}
          </ChatBubble>

          {status === "failed" && <p>Nenhuma resposta disponível</p>}
        </ChatContainer>

        {status === "succeeded" && (
          <>
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
      </div>
    </div>
  );
}
