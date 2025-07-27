import DOMPurify from "dompurify";
import { Flex, Skeleton, Divider } from "antd";

import { useAppSelector, useAppDispatch } from "src/store";
import { setAIFormStep } from "../../SupportSlice";
import Button from "components/Button";

export function Response() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.support.aiform.askn0.status);
  const response = useAppSelector((state) => state.support.aiform.response);

  const resolve = () => {
    console.log("create resolved ticket");
  };

  const openTicket = () => {
    console.log("open ticket");
    dispatch(setAIFormStep("form"));
  };

  return (
    <div>
      {status === "loading" && <Skeleton active paragraph={{ rows: 4 }} />}
      {status === "succeeded" && (
        <div>
          <h3>Farma do Suporte:</h3>
          <div
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(response!, { ADD_ATTR: ["target"] }),
            }}
          ></div>

          <Divider />

          <div
            style={{ textAlign: "center", marginTop: "30px", fontSize: "18px" }}
          >
            <p>Você conseguiu resolver o problema?</p>
          </div>
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
        </div>
      )}
      {status === "failed" && <p>Error fetching response.</p>}
    </div>
  );
}
