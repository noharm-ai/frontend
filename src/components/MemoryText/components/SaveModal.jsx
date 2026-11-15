import React, { useState, useRef } from "react";
import { useSelector } from "react-redux";
import { Row, Col, Button, Radio } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import Heading from "components/Heading";
import Modal from "components/Modal";
import Dropdown from "components/Dropdown";
import { Input, Textarea } from "components/Inputs";
import { CLINICAL_NOTES_MEMORY_TYPE } from "utils/memory";
import { getClinicalNoteVariableMenus } from "utils/clinicalNoteVariables";
import PermissionService from "services/PermissionService";
import Permission from "models/Permission";
import FieldSubstanceAutocomplete from "features/fields/FieldSubstanceAutocomplete/FieldSubstanceAutocomplete";
import FieldSubstanceClassAutocomplete from "features/fields/FieldSubstanceClassAutocomplete/FieldSubstanceClassAutocomplete";

import { VariableContainer } from "../index.style";
import { Form } from "styles/Form.style";

export default function SaveModal({
  save,
  open,
  setOpen,
  loadText,
  memoryType,
  // [{ label, items: [{ key: "{{var}}", label }] }]: the variables a text
  // takes, in place of the prescription clinical note ones
  variableGroups = null,
}) {
  const { t } = useTranslation();
  const prescription = useSelector((state) => state.prescriptions.single.data);
  const textRef = useRef(null);
  const [name, setName] = useState("");
  const [newText, setNewText] = useState("");
  const [chooseSubstanceModal, setChooseSubstanceModal] = useState(false);
  const [selectedSubstances, setSelectedSubstances] = useState([]);
  const [chooseClassModal, setChooseClassModal] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [chooseAlertaModal, setChooseAlertaModal] = useState(false);
  const [alertaBaseKey, setAlertaBaseKey] = useState("");
  const [alertaDescricao, setAlertaDescricao] = useState("completa");
  const [alertaNivel, setAlertaNivel] = useState("todos");

  const saveAction = () => {
    if (!PermissionService().has(Permission.MAINTAINER)) {
      save(name, newText);
    }

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
      const startPos = textField.selectionStart;
      const endPos = textField.selectionEnd;
      value =
        value.substring(0, startPos) +
        variable +
        value.substring(endPos, value.length);
    } else {
      value += variable;
    }

    setNewText(value);
  };

  const {
    patientVariables,
    examVariables,
    drugVariables,
    conciliaVariables,
    interventionVariables,
    alertVariables,
    utilsVariables,
  } = getClinicalNoteVariableMenus(t, prescription?.exams);

  const ALERTA_TIPO_WITH_OPTIONS = new Set([
    "{{alerta_tipo.dm}}",
    "{{alerta_tipo.dt}}",
    "{{alerta_tipo.iy}}",
    "{{alerta_tipo.it}}",
    "{{alerta_tipo.sl}}",
    "{{alerta_tipo.rx}}",
  ]);

  const addVariableEvent = ({ key }) => {
    if (key === "custom_substance") {
      setChooseSubstanceModal(true);
      return;
    }

    if (key === "custom_class") {
      setChooseClassModal(true);
      return;
    }

    if (ALERTA_TIPO_WITH_OPTIONS.has(key)) {
      setAlertaBaseKey(key);
      setChooseAlertaModal(true);
      return;
    }

    addVariable(key);
  };

  const addCustomSubstanceVar = () => {
    const subsList = selectedSubstances.map((v) => v.value).join("_");
    addVariable(`{{substancias.${subsList}}}`);

    setSelectedSubstances([]);
    setChooseSubstanceModal(false);
  };

  const addCustomClassVar = () => {
    const list = selectedClasses.map((v) => v.value).join("_");
    addVariable(`{{classes.${list}}}`);

    setSelectedClasses([]);
    setChooseClassModal(false);
  };

  const showVariables =
    !!variableGroups || `${memoryType}`.includes(CLINICAL_NOTES_MEMORY_TYPE);

  const addCustomAlertaVar = () => {
    const baseKey = alertaBaseKey.replace(/^\{\{/, "").replace(/\}\}$/, "");
    addVariable(`{{${baseKey}.${alertaDescricao}.${alertaNivel}}}`);

    setChooseAlertaModal(false);
    setAlertaBaseKey("");
    setAlertaDescricao("completa");
    setAlertaNivel("todos");
  };

  return (
    <>
      <Modal
        open={open}
        width={"70vw"}
        onCancel={() => setOpen(false)}
        onOk={() => saveAction()}
        okButtonProps={{
          disabled: name === "" || newText === "",
        }}
        okText="Salvar"
        okType="primary"
        cancelText="Cancelar"
      >
        <Heading
          as="label"
          $size="14px"
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
        <Row gutter={[16]}>
          <Col xs={showVariables ? 17 : 24}>
            <Heading
              as="label"
              $size="14px"
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
          </Col>
          {showVariables && (
            <Col xs={7}>
              <VariableContainer>
                <div className="variables-title">Váriáveis</div>
                <div className="variables-legend">
                  Estas varíaveis são substituídas pelos valores ao carregar os
                  textos salvos. Ex: {"{{ nome_paciente }}"} será substituído
                  pelo nome do paciente. <br />
                  Escolha um grupo abaixo e clique na variável que deseja
                  incluir.
                </div>
                <div className="variables-group">
                  {variableGroups && (
                    <div className="variables-group-list">
                      {variableGroups.map((group) => (
                        <Dropdown
                          key={group.label}
                          menu={{
                            items: group.items,
                            onClick: addVariableEvent,
                          }}
                          trigger={["click"]}
                        >
                          <Button icon={<DownOutlined />}>{group.label}</Button>
                        </Dropdown>
                      ))}
                    </div>
                  )}
                  {!variableGroups && (
                  <div className="variables-group-list">
                    <Dropdown
                      menu={{
                        items: patientVariables,
                        onClick: addVariableEvent,
                      }}
                      trigger={["click"]}
                    >
                      <Button icon={<DownOutlined />}>Paciente</Button>
                    </Dropdown>

                    <Dropdown
                      menu={{
                        items: examVariables,
                        onClick: addVariableEvent,
                      }}
                      trigger={["click"]}
                    >
                      <Button icon={<DownOutlined />}>Exames</Button>
                    </Dropdown>

                    <Dropdown
                      menu={{
                        items: drugVariables,
                        onClick: addVariableEvent,
                      }}
                      trigger={["click"]}
                    >
                      <Button icon={<DownOutlined />}>Medicamentos</Button>
                    </Dropdown>

                    <Dropdown
                      menu={{
                        items: conciliaVariables,
                        onClick: addVariableEvent,
                      }}
                      trigger={["click"]}
                    >
                      <Button icon={<DownOutlined />}>Conciliação</Button>
                    </Dropdown>

                    <Dropdown
                      menu={{
                        items: interventionVariables,
                        onClick: addVariableEvent,
                      }}
                      trigger={["click"]}
                    >
                      <Button icon={<DownOutlined />}>Intervenções</Button>
                    </Dropdown>

                    <Dropdown
                      menu={{
                        items: alertVariables,
                        onClick: addVariableEvent,
                      }}
                      trigger={["click"]}
                    >
                      <Button icon={<DownOutlined />}>Alertas</Button>
                    </Dropdown>

                    <Dropdown
                      menu={{
                        items: utilsVariables,
                        onClick: addVariableEvent,
                      }}
                      trigger={["click"]}
                    >
                      <Button icon={<DownOutlined />}>Utilidades</Button>
                    </Dropdown>
                  </div>
                  )}
                </div>
              </VariableContainer>
            </Col>
          )}
        </Row>
      </Modal>
      <Modal
        open={chooseSubstanceModal}
        width={"500px"}
        onCancel={() => {
          setChooseSubstanceModal(false);
          setSelectedSubstances([]);
        }}
        onOk={addCustomSubstanceVar}
        okText="Salvar"
        okType="primary"
        cancelText="Cancelar"
      >
        <Form>
          <div className={`form-row `}>
            <div className="form-label">
              <label>Escolha a lista de substâncias:</label>
            </div>
            <div className="form-input">
              <FieldSubstanceAutocomplete
                onChange={(v) => setSelectedSubstances(v)}
                value={selectedSubstances}
              />
            </div>
          </div>
        </Form>
      </Modal>

      <Modal
        open={chooseClassModal}
        width={"500px"}
        onCancel={() => {
          setChooseClassModal(false);
          setSelectedClasses([]);
        }}
        onOk={addCustomClassVar}
        okText="Salvar"
        okType="primary"
        cancelText="Cancelar"
      >
        <Form>
          <div className={`form-row `}>
            <div className="form-label">
              <label>Escolha a lista de classes:</label>
            </div>
            <div className="form-input">
              <FieldSubstanceClassAutocomplete
                onChange={(v) => setSelectedClasses(v)}
                value={selectedClasses}
              />
            </div>
          </div>
        </Form>
      </Modal>

      <Modal
        open={chooseAlertaModal}
        width={"460px"}
        onCancel={() => {
          setChooseAlertaModal(false);
          setAlertaBaseKey("");
          setAlertaDescricao("completa");
          setAlertaNivel("todos");
        }}
        onOk={addCustomAlertaVar}
        okText="Salvar"
        okType="primary"
        cancelText="Cancelar"
      >
        <Form style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "16px" }}>
          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: "10px" }}>
              Descrição
            </label>
            <Radio.Group
              value={alertaDescricao}
              onChange={(e) => setAlertaDescricao(e.target.value)}
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {[
                {
                  value: "completa",
                  label: "Completa",
                  description:
                    "Lista agrupada por medicamento, com a explicação completa sobre o alerta",
                },
                {
                  value: "simplificada",
                  label: "Simplificada",
                  description:
                    "Lista direta de todos os medicamentos relacionados com o alerta",
                },
              ].map(({ value, label, description }) => (
                <Radio
                  key={value}
                  value={value}
                  style={{
                    border: `1px solid ${alertaDescricao === value ? "#1677ff" : "#d9d9d9"}`,
                    borderRadius: "8px",
                    padding: "10px 14px",
                    margin: 0,
                    background: alertaDescricao === value ? "#f0f7ff" : "#fafafa",
                    alignItems: "flex-start",
                  }}
                >
                  <span style={{ fontWeight: 500 }}>{label}</span>
                  <br />
                  <span style={{ fontSize: "12px", color: "#888", fontWeight: 400 }}>
                    {description}
                  </span>
                </Radio>
              ))}
            </Radio.Group>
          </div>

          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: "10px" }}>
              Nível do alerta
            </label>
            <Radio.Group
              value={alertaNivel}
              onChange={(e) => setAlertaNivel(e.target.value)}
            >
              <Radio value="todos">Todos</Radio>
              <Radio value="alto">Alto</Radio>
              <Radio value="medio">Médio</Radio>
              <Radio value="baixo">Baixo</Radio>
            </Radio.Group>
          </div>
        </Form>
      </Modal>
    </>
  );
}
