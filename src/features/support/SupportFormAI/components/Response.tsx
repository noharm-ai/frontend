import DOMPurify from "dompurify";
import { Flex, Skeleton, Divider, Space, Popconfirm } from "antd";
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

interface ResponseInterface {
  mode: "default" | "simple";
}

export function Response({ mode }: ResponseInterface) {
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.support.aiform.askn0.status);
  const response = useAppSelector((state) => state.support.aiform.response);
  const articles = useAppSelector(
    (state) => state.support.aiform.relatedArticles.list
  );
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

              {articles.length > 0 && (
                <>
                  <div
                    style={{
                      marginTop: "20px",
                      marginBottom: "5px",
                      color: "#696766",
                      fontWeight: "600",
                    }}
                  >
                    Artigos relacionados:
                  </div>
                  <Space wrap>
                    {articles.map((a: any) => (
                      <Button
                        type="dashed"
                        href={`${
                          import.meta.env.VITE_APP_ODOO_LINK
                        }knowledge/article/${a.id}`}
                        target="blank"
                        key={a.id}
                        size="small"
                      >
                        {a.name}
                      </Button>
                    ))}
                  </Space>
                </>
              )}

              {mode === "default" && (
                <>
                  <Divider />

                  <ActionSection>
                    <ActionText>Você conseguiu resolver o problema?</ActionText>
                  </ActionSection>
                </>
              )}
            </>
          )}
        </motion.div>

        {status === "failed" && <p>Nenhuma resposta disponível</p>}
      </ChatBubble>

      {status === "succeeded" && mode === "default" && (
        <ChatBubble className="user">
          {currentStep.indexOf("form") !== -1 ? (
            <>Não, quero abrir um chamado</>
          ) : (
            <Flex justify="center" align="center">
              <Popconfirm
                title="Atenção: Nenhum chamado será aberto"
                description={
                  <>
                    Caso queira abrir um chamado, clique em{" "}
                    <strong>"Não, quero abrir um chamado".</strong>
                    <br />
                    Assim, sua solicitação/dúvida será encaminhada para nossa
                    equipe de suporte.
                    <br />
                    <br />
                    Deseja realmente encerrar o atendimento?
                  </>
                }
                okText="Sim"
                cancelText="Não"
                onConfirm={() => resolve()}
                zIndex={9999}
              >
                <Button type="primary" size="large">
                  Sim, obrigado!
                </Button>
              </Popconfirm>
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
