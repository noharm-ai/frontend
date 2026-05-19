import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button as AntButton } from "antd";
import { DownOutlined } from "@ant-design/icons";

import Modal from "components/Modal";
import { Textarea } from "components/Inputs";
import Button from "components/Button";
import { Col, Row } from "components/Grid";
import Tooltip from "components/Tooltip";
import Dropdown from "components/Dropdown";
import DrugAlertTypeEnum from "models/DrugAlertTypeEnum";
import {
  trackInterventionAction,
  TrackedInterventionAction,
} from "src/utils/tracker";

import { EditorBox } from "components/Forms/Form.style";
import { Form } from "styles/Form.style";
import { InterventionVariableContainer } from "../Intervention.style";

export function ObservationDefaultText({
  open,
  setOpen,
  initialContent,
  saveDefaultText,
}) {
  const { t } = useTranslation();
  const [content, setContent] = useState("");
  const textRef = useRef(null);

  const alertVariables = [{ label: "Todos", key: "{{alertas}}" }];
  alertVariables.push({
    label: "Por nível",
    children: [
      { key: "{{alerta_nivel.low}}", label: "Nível baixo" },
      { key: "{{alerta_nivel.medium}}", label: "Nível médio" },
      { key: "{{alerta_nivel.high}}", label: "Nível alto" },
    ],
  });
  alertVariables.push({
    label: "Por tipo",
    children: DrugAlertTypeEnum.getAlertTypes(t).map((a) => ({
      key: `{{alerta_tipo.${a.id}}}`,
      label: a.label,
    })),
  });

  const addVariableEvent = ({ key }) => {
    addVariable(key);
  };

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const addVariable = (variable) => {
    let value = content;
    const textField = textRef.current?.resizableTextArea.textArea;

    if (textField.selectionStart || textField.selectionStart === "0") {
      const startPos = textField.selectionStart;
      const endPos = textField.selectionEnd;
      value =
        value.substring(0, startPos) +
        variable +
        value.substring(endPos, value.length);
    } else {
      value += variable;
    }

    setContent(value);

    trackInterventionAction(TrackedInterventionAction.DEFAULT_TEXT_VARIABLE, {
      title: variable,
    });
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
                <Dropdown
                  menu={{ items: alertVariables, onClick: addVariableEvent }}
                  trigger={["click"]}
                >
                  <AntButton icon={<DownOutlined />}>Alertas</AntButton>
                </Dropdown>
              </div>
            </div>
          </InterventionVariableContainer>
        </Col>
      </Row>
    </Modal>
  );
}
