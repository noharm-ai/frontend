import React, { useState } from "react";

import Heading from "components/Heading";
import Modal from "components/Modal";
import { Input } from "components/Inputs";

export default function SaveModal({ save, open, setOpen }) {
  const [name, setName] = useState("");

  const saveAction = () => {
    save(name);
    setOpen(false);
    setName("");
  };

  return (
    <Modal
      visible={open}
      onCancel={() => setOpen(false)}
      onOk={() => saveAction()}
      okButtonProps={{
        disabled: name === "",
      }}
      okText="Salvar"
      okType="primary gtm-bt-memorytext-savemodal"
      cancelText="Cancelar"
    >
      <Heading
        as="label"
        size="14px"
        className="fixed"
        style={{ marginTop: "12px" }}
      >
        Nome do texto padrão:
      </Heading>
      <Input
        onChange={({ target }) => setName(target.value)}
        value={name}
        maxLength={50}
      />
    </Modal>
  );
}
