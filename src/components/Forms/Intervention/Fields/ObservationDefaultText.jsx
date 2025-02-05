import React, { useState, useRef } from "react";

import Modal from "components/Modal";
import { Textarea } from "components/Inputs";
import Button from "components/Button";
import { Col, Row } from "components/Grid";
import Tooltip from "components/Tooltip";

import { EditorBox } from "components/Forms/Form.style";
import { Form } from "styles/Form.style";
import { InterventionVariableContainer } from "../Intervention.style";

export function ObservationDefaultText({
  open,
  setOpen,
  initialContent,
  saveDefaultText,
}) {
  const [content, setContent] = useState(initialContent);
  const textRef = useRef(null);

  const addVariable = (variable) => {
    let value = content;
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

    setContent(value);
  };

  const save = () => {
    if (content) {
      saveDefaultText(content);
      setOpen(false);
    }
  };

  return (
    <Modal
      open={open}
      width={"700px"}
      onCancel={() => {
        setOpen(false);
      }}
      onOk={save}
      okButtonProps={{ disabled: !content }}
      okText="Salvar"
      okType="primary"
      cancelText="Cancelar"
    >
      <Row gutter={[16]}>
        <Col xs={16}>
          <Form>
            <div className={`form-row `}>
              <div className="form-label">
                <label>Texto padrão:</label>
              </div>
              <div className="form-input">
                <EditorBox>
                  <Textarea
                    autoFocus
                    value={content || ""}
                    onChange={({ target }) => setContent(target.value)}
                    style={{ minHeight: "400px", marginTop: "10px" }}
                    ref={textRef}
                  />
                </EditorBox>
              </div>
            </div>
          </Form>
        </Col>
        <Col xs={8}>
          <InterventionVariableContainer>
            <div className="variables-title">Váriáveis</div>
            <div className="variables-legend">
              Estas varíaveis são substituídas pelos valores ao carregar os
              textos salvos.
            </div>
            <div className="variables-group">
              <div className="variables-group-list">
                <Button onClick={() => addVariable("{{data_atual}}")}>
                  Data atual
                </Button>
                <Button onClick={() => addVariable("{{nome_medicamento}}")}>
                  Medicamento
                </Button>
                <Tooltip title="Nome do medicamento substituto ou relacionado que foi selecionado na intervenção">
                  <Button
                    onClick={() =>
                      addVariable("{{nome_medicamento_substituto}}")
                    }
                  >
                    Med. substituto/relacionado
                  </Button>
                </Tooltip>
              </div>
            </div>
          </InterventionVariableContainer>
        </Col>
      </Row>
    </Modal>
  );
}
