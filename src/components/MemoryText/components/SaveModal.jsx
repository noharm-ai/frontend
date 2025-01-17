import React, { useState, useRef } from "react";
import { Row, Col } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import Heading from "components/Heading";
import Modal from "components/Modal";
import Tag from "components/Tag";
import Dropdown from "components/Dropdown";
import { Input, Textarea } from "components/Inputs";
import { CLINICAL_NOTES_MEMORY_TYPE } from "utils/memory";
import PermissionService from "services/PermissionService";
import Permission from "models/Permission";
import DrugAlertTypeEnum from "models/DrugAlertTypeEnum";

import { VariableContainer } from "../index.style";

export default function SaveModal({
  save,
  open,
  setOpen,
  loadText,
  memoryType,
}) {
  const { t } = useTranslation();
  const textRef = useRef(null);
  const [name, setName] = useState("");
  const [newText, setNewText] = useState("");

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

  const patientVariables = [
    {
      label: "Alergias",
      key: "{{alergias}}",
    },
    {
      label: "Altura",
      key: "{{altura_paciente}}",
    },
    {
      label: "Nome",
      key: "{{nome_paciente}}",
    },
    {
      label: "Idade",
      key: "{{idade_paciente}}",
    },
    {
      label: "Peso",
      key: "{{peso_paciente}}",
    },

    {
      label: "IMC",
      key: "{{imc_paciente}}",
    },
    {
      label: "Superfície Corporal",
      key: "{{superficie_corporal_paciente}}",
    },

    {
      label: "Escore Global",
      key: "{{escore_global}}",
    },
    {
      label: "Risco do Paciente",
      key: "{{risco_paciente}}",
    },
  ].sort((a, b) => a.label.localeCompare(b.label));

  const examVariables = [
    {
      label: "Exames Principais (card)",
      key: "{{exames}}",
    },
  ].sort((a, b) => a.label.localeCompare(b.label));

  const drugVariables = [
    {
      label: "Antimicrobianos",
      key: "{{antimicrobianos}}",
    },
    {
      label: "Alta Vigilância",
      key: "{{alta_vigilancia}}",
    },
    {
      label: "Controlados",
      key: "{{controlados}}",
    },
    {
      label: "Dialisáveis",
      key: "{{dialisaveis}}",
    },
    {
      label: "Não padronizados",
      key: "{{nao_padronizados}}",
    },
    {
      label: "Antitrombóticos",
      key: "{{antitromboticos}}",
    },
    {
      label: "Profilaxia de Úlcera de Estresse",
      key: "{{profilaxia_ulcera_estresse}}",
    },
    {
      label: "Profilaxia Ocular",
      key: "{{profilaxia_ocular}}",
    },
    {
      label: "Analgésicos",
      key: "{{analgesicos}}",
    },
    {
      label: "Anestésicos Gerais",
      key: "{{anestesicos_gerais}}",
    },
    {
      label: "Vasopressores e Inotrópicos",
      key: "{{vasopressores_inotropicos}}",
    },
  ].sort((a, b) => a.label.localeCompare(b.label));

  const conciliaVariables = [
    {
      label: "Medicamentos Conciliados",
      key: "{{medicamentos_conciliados}}",
    },
    {
      label: "Medicamentos Não Conciliados",
      key: "{{medicamentos_nao_conciliados}}",
    },
  ].sort((a, b) => a.label.localeCompare(b.label));

  const interventionVariables = [
    {
      label: "Todas",
      key: "{{intervencoes}}",
    },
  ].sort((a, b) => a.label.localeCompare(b.label));

  const alertVariables = [
    {
      label: "Todos",
      key: "{{alertas}}",
    },
  ].sort((a, b) => a.label.localeCompare(b.label));

  alertVariables.push({
    label: "Por nível",
    children: [
      {
        key: `{{alerta_nivel.low}}`,
        label: "Nível baixo",
      },
      {
        key: `{{alerta_nivel.medium}}`,
        label: "Nível médio",
      },
      {
        key: `{{alerta_nivel.high}}`,
        label: "Nível alto",
      },
    ],
  });

  alertVariables.push({
    label: "Por tipo",
    children: DrugAlertTypeEnum.getAlertTypes(t).map((a) => ({
      key: `{{alerta_tipo.${a.id}}}`,
      label: a.label,
    })),
  });

  const utilsVariables = [
    {
      label: "Assinatura",
      key: "{{assinatura}}",
    },
    {
      label: "Data Atual",
      key: "{{data_atual}}",
    },
  ].sort((a, b) => a.label.localeCompare(b.label));

  const addVariableEvent = ({ key }) => {
    addVariable(key);
  };

  return (
    <Modal
      open={open}
      width={"70vw"}
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
      <Row gutter={[16]}>
        <Col
          xs={`${memoryType}`.includes(CLINICAL_NOTES_MEMORY_TYPE) ? 17 : 24}
        >
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
        </Col>
        {`${memoryType}`.includes(CLINICAL_NOTES_MEMORY_TYPE) && (
          <Col xs={7}>
            <VariableContainer>
              <div className="variables-title">Váriáveis</div>
              <div className="variables-legend">
                Estas varíaveis são substituídas pelos valores ao carregar os
                textos salvos. Ex: {"{{ nome_paciente }}"} será substituído pelo
                nome do paciente. <br />
                Escolha um grupo abaixo e clique na variável que deseja incluir.
              </div>
              <div className="variables-group">
                <div className="variables-group-list">
                  <Dropdown
                    menu={{
                      items: patientVariables,
                      onClick: addVariableEvent,
                    }}
                    trigger={["click"]}
                  >
                    <Tag
                      style={{ cursor: "pointer" }}
                      color="blue"
                      icon={<DownOutlined />}
                    >
                      Paciente
                    </Tag>
                  </Dropdown>

                  <Dropdown
                    menu={{
                      items: examVariables,
                      onClick: addVariableEvent,
                    }}
                    trigger={["click"]}
                  >
                    <Tag
                      style={{ cursor: "pointer" }}
                      color="green"
                      icon={<DownOutlined />}
                    >
                      Exames
                    </Tag>
                  </Dropdown>

                  <Dropdown
                    menu={{
                      items: drugVariables,
                      onClick: addVariableEvent,
                    }}
                    trigger={["click"]}
                  >
                    <Tag
                      style={{ cursor: "pointer" }}
                      color="purple"
                      icon={<DownOutlined />}
                    >
                      Medicamentos
                    </Tag>
                  </Dropdown>

                  <Dropdown
                    menu={{
                      items: conciliaVariables,
                      onClick: addVariableEvent,
                    }}
                    trigger={["click"]}
                  >
                    <Tag
                      style={{ cursor: "pointer" }}
                      color="cyan"
                      icon={<DownOutlined />}
                    >
                      Conciliação
                    </Tag>
                  </Dropdown>

                  <Dropdown
                    menu={{
                      items: interventionVariables,
                      onClick: addVariableEvent,
                    }}
                    trigger={["click"]}
                  >
                    <Tag
                      style={{ cursor: "pointer" }}
                      color="volcano"
                      icon={<DownOutlined />}
                    >
                      Intervenções
                    </Tag>
                  </Dropdown>

                  <Dropdown
                    menu={{
                      items: alertVariables,
                      onClick: addVariableEvent,
                    }}
                    trigger={["click"]}
                  >
                    <Tag
                      style={{ cursor: "pointer" }}
                      color="red"
                      icon={<DownOutlined />}
                    >
                      Alertas
                    </Tag>
                  </Dropdown>

                  <Dropdown
                    menu={{
                      items: utilsVariables,
                      onClick: addVariableEvent,
                    }}
                    trigger={["click"]}
                  >
                    <Tag style={{ cursor: "pointer" }} icon={<DownOutlined />}>
                      Utilidades
                    </Tag>
                  </Dropdown>
                </div>
              </div>
            </VariableContainer>
          </Col>
        )}
      </Row>
    </Modal>
  );
}
