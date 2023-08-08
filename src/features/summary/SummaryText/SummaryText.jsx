import React from "react";
import { useSelector } from "react-redux";

import DefaultModal from "components/Modal";
import { Textarea } from "components/Inputs";
import notification from "components/notification";
import Heading from "components/Heading";

import { Form } from "styles/Form.style";
import { blocksToText } from "../verbalizers";

function SummaryText({ open, setOpen }) {
  const blocks = useSelector((state) => state.summary.blocks);

  const handleOK = () => {
    navigator.clipboard.writeText(blocksToText(blocks));
    notification.success({ message: "Sumário de Alta copiado!" });
  };

  return (
    <DefaultModal
      width={"50vw"}
      centered
      destroyOnClose
      onOk={handleOK}
      onCancel={() => setOpen(false)}
      open={open}
      cancelText="Fechar"
      okText="Copiar"
    >
      <header>
        <Heading margin="0 0 11px">Sumário de Alta</Heading>
      </header>
      <Form>
        <div className={`form-row`}>
          <div className="form-input">
            <Textarea
              value={blocksToText(blocks)}
              style={{ minHeight: "50vh" }}
            ></Textarea>
          </div>
        </div>
      </Form>
    </DefaultModal>
  );
}

export default SummaryText;
