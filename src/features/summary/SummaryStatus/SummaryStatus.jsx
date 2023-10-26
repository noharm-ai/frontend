import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { CheckOutlined } from "@ant-design/icons";

import Button from "components/Button";
import Tooltip from "components/Tooltip";
import { SummaryStatusContainer } from "../Summary.style";

export default function SummaryStatus({ setModalSave }) {
  const saveStatus = useSelector((state) => state.summary.saveStatus);

  useEffect(() => {
    const beforeunloadHandler = (event) => {
      const confirm =
        "As alterações não foram salvas. Deseja sair mesmo assim?";
      event.preventDefault();

      (event || window.event).returnValue = confirm; //Gecko + IE
      return confirm; //Gecko + Webkit, Safari, Chrome etc.
    };

    if (saveStatus === "saved") {
      window.removeEventListener("beforeunload", beforeunloadHandler);
    } else {
      window.addEventListener("beforeunload", beforeunloadHandler);
    }

    return () => {
      window.removeEventListener("beforeunload", beforeunloadHandler);
    };
  }, [saveStatus]);

  return (
    <SummaryStatusContainer completed={saveStatus === "saved"}>
      <Tooltip
        title={
          saveStatus === "saved"
            ? "Sumário finalizado com sucesso!"
            : "Clique no botão ao lado para Finalizar a montagem do sumário"
        }
      >
        <div className="summary-status">
          <div className="summary-status-header">
            {saveStatus === "saved" ? "Finalizado!" : "Pendente"}
          </div>
        </div>
      </Tooltip>
      <div className="summary-status-action">
        <Tooltip title="Finalizar Sumário">
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={<CheckOutlined />}
            disabled={saveStatus === "saved"}
            onClick={() => setModalSave(true)}
          />
        </Tooltip>
      </div>
    </SummaryStatusContainer>
  );
}
