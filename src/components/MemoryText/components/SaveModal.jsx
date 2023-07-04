import React, { useState, useRef } from "react";

import Heading from "components/Heading";
import Modal from "components/Modal";
import Tag from "components/Tag";
import Tooltip from "components/Tooltip";
import { Input, Textarea } from "components/Inputs";
import { CLINICAL_NOTES_MEMORY_TYPE } from "utils/memory";

export default function SaveModal({
  save,
  open,
  setOpen,
  loadText,
  memoryType,
}) {
  const textRef = useRef(null);
  const [name, setName] = useState("");
  const [newText, setNewText] = useState("");

  const saveAction = () => {
    save(name, newText);
    if (loadText) {
      loadText(newText);
    }

    setOpen(false);
    setName("");
    setNewText("");
  };

  const addVariable = (variable) => {
    let value = newText;
    const textField = textRef.current?.resizableTextArea.textArea;

    if (textField.selectionStart || textField.selectionStart === "0") {
      var startPos = textField.selectionStart;
      var endPos = textField.selectionEnd;
      value =
        value.substring(0, startPos) +
        variable +
        value.substring(endPos, value.length);
    } else {
      value += variable;
    }

    setNewText(value);
  };

  return (
    <Modal
      visible={open}
      onCancel={() => setOpen(false)}
      onOk={() => saveAction()}
      okButtonProps={{
        disabled: name === "" || newText === "",
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
      <Heading
        as="label"
        size="14px"
        className="fixed"
        style={{ marginTop: "12px" }}
      >
        Texto:
      </Heading>
      <Textarea
        value={newText}
        style={{ minHeight: "40vh" }}
        onChange={({ target }) => setNewText(target.value)}
        ref={textRef}
      />

      {memoryType === CLINICAL_NOTES_MEMORY_TYPE && (
        <div style={{ marginTop: "10px" }}>
          <span style={{ marginRight: "10px" }}>
            <Tooltip
              title="Estas varíaveis são substituídas pelos valores ao carregar os textos salvos. Ex: {{nome_paciente}} será substituído pelo nome do paciente"
              underline
            >
              Váriáveis:
            </Tooltip>
          </span>
          <Tag
            onClick={() => addVariable("{{nome_paciente}}")}
            style={{ cursor: "pointer" }}
          >
            Nome do paciente
          </Tag>
          <Tag
            onClick={() => addVariable("{{intervencoes}}")}
            style={{ cursor: "pointer" }}
          >
            Intervenções
          </Tag>
          <Tag
            onClick={() => addVariable("{{alertas}}")}
            style={{ cursor: "pointer" }}
          >
            Alertas
          </Tag>
          <Tag
            onClick={() => addVariable("{{assinatura}}")}
            style={{ cursor: "pointer" }}
          >
            Assinatura
          </Tag>
        </div>
      )}
    </Modal>
  );
}
