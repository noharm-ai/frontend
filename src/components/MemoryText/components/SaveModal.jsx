import React, { useState, useRef } from "react";

import Heading from "components/Heading";
import Modal from "components/Modal";
import Tag from "components/Tag";
import Tooltip from "components/Tooltip";
import { Input, Textarea } from "components/Inputs";
import { CLINICAL_NOTES_MEMORY_TYPE } from "utils/memory";

import { VariableContainer } from "../index.style";

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
      width={"45vw"}
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
        <VariableContainer>
          <div className="variables-title">Váriáveis</div>
          <div className="variables-legend">
            Estas varíaveis são substituídas pelos valores ao carregar os textos
            salvos. Ex: {"{{ nome_paciente }}"} será substituído pelo nome do
            paciente. <br />
            Clique na variável para adicioná-la ao texto.
          </div>
          <div className="variables-group">
            <div className="variables-group-list">
              <Tooltip title="Clique para adicionar o Nome do Paciente">
                <Tag
                  onClick={() => addVariable("{{nome_paciente}}")}
                  style={{ cursor: "pointer" }}
                  color="geekblue"
                >
                  Nome
                </Tag>
              </Tooltip>
              <Tooltip title="Clique para adicionar a Idade do Paciente">
                <Tag
                  onClick={() => addVariable("{{idade_paciente}}")}
                  style={{ cursor: "pointer" }}
                  color="geekblue"
                >
                  Idade
                </Tag>
              </Tooltip>
              <Tooltip title="Clique para adicionar a Peso do Paciente">
                <Tag
                  onClick={() => addVariable("{{peso_paciente}}")}
                  style={{ cursor: "pointer" }}
                  color="geekblue"
                >
                  Peso
                </Tag>
              </Tooltip>
              <Tooltip title="Clique para adicionar a Altura do Paciente">
                <Tag
                  onClick={() => addVariable("{{altura_paciente}}")}
                  style={{ cursor: "pointer" }}
                  color="geekblue"
                >
                  Altura
                </Tag>
              </Tooltip>
              <Tooltip title="Clique para adicionar o IMC">
                <Tag
                  onClick={() => addVariable("{{imc_paciente}}")}
                  style={{ cursor: "pointer" }}
                  color="geekblue"
                >
                  IMC
                </Tag>
              </Tooltip>
              <Tooltip title="Clique para adicionar a Superfície Corporal">
                <Tag
                  onClick={() =>
                    addVariable("{{superficie_corporal_paciente}}")
                  }
                  style={{ cursor: "pointer" }}
                  color="geekblue"
                >
                  Superfície Corporal
                </Tag>
              </Tooltip>
              <Tooltip title="Clique para adicionar a lista de Alergias do paciente">
                <Tag
                  onClick={() => addVariable("{{alergias}}")}
                  style={{ cursor: "pointer" }}
                  color="geekblue"
                >
                  Alergias
                </Tag>
              </Tooltip>
              <Tooltip title="Clique para adicionar a lista de Exames exibidos na prescrição.">
                <Tag
                  onClick={() => addVariable("{{exames}}")}
                  style={{ cursor: "pointer" }}
                  color="geekblue"
                >
                  Exames
                </Tag>
              </Tooltip>
            </div>
          </div>

          <div className="variables-group">
            <div className="variables-group-list">
              <Tooltip title="Clique para adicionar a lista de Intervenções realizadas nesta prescrição">
                <Tag
                  onClick={() => addVariable("{{intervencoes}}")}
                  style={{ cursor: "pointer" }}
                  color="magenta"
                >
                  Intervenções
                </Tag>
              </Tooltip>
              <Tooltip title="Clique para adicionar a lista de Alertas presentes nesta prescrição">
                <Tag
                  onClick={() => addVariable("{{alertas}}")}
                  style={{ cursor: "pointer" }}
                  color="magenta"
                >
                  Alertas
                </Tag>
              </Tooltip>
              <Tooltip title="Clique para adicionar a lista de Antimicrobianos presentes nesta prescrição">
                <Tag
                  onClick={() => addVariable("{{antimicrobianos}}")}
                  style={{ cursor: "pointer" }}
                  color="magenta"
                >
                  Antimicrobianos
                </Tag>
              </Tooltip>
              <Tooltip title="Clique para adicionar a lista de medicamentos de Alta Vigilância presentes nesta prescrição">
                <Tag
                  onClick={() => addVariable("{{alta_vigilancia}}")}
                  style={{ cursor: "pointer" }}
                  color="magenta"
                >
                  Alta Vigilância
                </Tag>
              </Tooltip>
              <Tooltip title="Clique para adicionar a lista de medicamentos de Controlados presentes nesta prescrição">
                <Tag
                  onClick={() => addVariable("{{controlados}}")}
                  style={{ cursor: "pointer" }}
                  color="magenta"
                >
                  Controlados
                </Tag>
              </Tooltip>
            </div>
          </div>

          <div className="variables-group">
            <div className="variables-group-list">
              <Tooltip title="Clique para adicionar a lista de Medicamentos Conciliados">
                <Tag
                  onClick={() => addVariable("{{medicamentos_conciliados}}")}
                  style={{ cursor: "pointer" }}
                  color="purple"
                >
                  Medicamentos conciliados
                </Tag>
              </Tooltip>
              <Tooltip title="Clique para adicionar a lista de Medicamentos Não Conciliados">
                <Tag
                  onClick={() =>
                    addVariable("{{medicamentos_nao_conciliados}}")
                  }
                  style={{ cursor: "pointer" }}
                  color="purple"
                >
                  Medicamentos NÃO conciliados
                </Tag>
              </Tooltip>
            </div>
          </div>

          <div className="variables-group">
            <div className="variables-group-list">
              <Tooltip title="Clique para adicionar a sua assinatura">
                <Tag
                  onClick={() => addVariable("{{assinatura}}")}
                  style={{ cursor: "pointer" }}
                  color="cyan"
                >
                  Assinatura
                </Tag>
              </Tooltip>
              <Tooltip title="Clique para adicionar a data atual">
                <Tag
                  onClick={() => addVariable("{{data_atual}}")}
                  style={{ cursor: "pointer" }}
                  color="cyan"
                >
                  Data atual
                </Tag>
              </Tooltip>
            </div>
          </div>
        </VariableContainer>
      )}
    </Modal>
  );
}
