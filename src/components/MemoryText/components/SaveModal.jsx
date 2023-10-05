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
      open={open}
      width={"30vw"}
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
          <Tooltip title="Clique para adicionar o Nome do Paciente">
            <Tag
              onClick={() => addVariable("{{nome_paciente}}")}
              style={{ cursor: "pointer", marginBottom: "5px" }}
            >
              Nome do paciente
            </Tag>
          </Tooltip>
          <Tooltip title="Clique para adicionar a lista de Intervenções realizadas nesta prescrição">
            <Tag
              onClick={() => addVariable("{{intervencoes}}")}
              style={{ cursor: "pointer" }}
            >
              Intervenções
            </Tag>
          </Tooltip>
          <Tooltip title="Clique para adicionar a lista de Alertas presentes nesta prescrição">
            <Tag
              onClick={() => addVariable("{{alertas}}")}
              style={{ cursor: "pointer" }}
            >
              Alertas
            </Tag>
          </Tooltip>
          <Tooltip title="Clique para adicionar a lista de Medicamentos Conciliados">
            <Tag
              onClick={() => addVariable("{{medicamentos_conciliados}}")}
              style={{ cursor: "pointer" }}
            >
              Medicamentos conciliados
            </Tag>
          </Tooltip>
          <Tooltip title="Clique para adicionar a lista de Medicamentos Não Conciliados">
            <Tag
              onClick={() => addVariable("{{medicamentos_nao_conciliados}}")}
              style={{ cursor: "pointer" }}
            >
              Medicamentos NÃO conciliados
            </Tag>
          </Tooltip>
          <Tooltip title="Clique para adicionar a sua assinatura">
            <Tag
              onClick={() => addVariable("{{assinatura}}")}
              style={{ cursor: "pointer" }}
            >
              Assinatura
            </Tag>
          </Tooltip>
        </div>
      )}
    </Modal>
  );
}
