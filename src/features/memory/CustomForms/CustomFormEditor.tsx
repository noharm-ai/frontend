import React, { useState } from "react";
import { Formik, useFormikContext } from "formik";
import * as Yup from "yup";
import { Divider, Tabs } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import styled from "styled-components";

import DefaultModal from "components/Modal";
import Switch from "components/Switch";
import { Input, Select } from "components/Inputs";
import Button from "components/Button";
import { Form } from "styles/Form.style";

export interface Question {
  id: string;
  label: string;
  type: "text" | "number" | "options" | "options-multiple";
  options: string[];
  required: boolean;
}

export interface FormGroup {
  group: string;
  questions: Question[];
}

export interface CustomForm {
  id?: string;
  name: string;
  active?: boolean;
  data: FormGroup[];
}

interface CustomFormEditorProps {
  open: boolean;
  initialForm: CustomForm | null;
  isSaving: boolean;
  onSave: (form: CustomForm) => void;
  onCancel: () => void;
}

const GroupContainer = styled.div`
  padding: 1rem;
  background: #fafafa;
  border-radius: 8px;
  margin-bottom: 0.5rem;
`;

const QuestionCard = styled.div`
  padding: 0.75rem;
  background: #f0f0f0;
  border-radius: 6px;
  margin-top: 0.5rem;
`;

const GroupHeader = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  margin-bottom: 0.5rem;

  .group-name-field {
    flex: 1;
  }
`;

const emptyQuestion = (): Question => ({
  id: "",
  label: "",
  type: "text",
  options: [],
  required: false,
});

const emptyGroup = (): FormGroup => ({
  group: "",
  questions: [emptyQuestion()],
});

const emptyForm = (): CustomForm => ({
  id: "",
  name: "",
  active: true,
  data: [emptyGroup()],
});

const questionTypeOptions = [
  { value: "text", label: "Texto" },
  { value: "number", label: "Número" },
  { value: "options", label: "Seleção única" },
  { value: "options-multiple", label: "Seleção múltipla" },
];

function FormBody() {
  const { values, errors, setFieldValue } = useFormikContext<CustomForm>();
  const [activeKey, setActiveKey] = useState("0");

  const addGroup = () => {
    const newIdx = values.data.length;
    setFieldValue("data", [...values.data, emptyGroup()]);
    setActiveKey(String(newIdx));
  };

  const removeGroup = (gIdx: number) => {
    const currentActive = parseInt(activeKey);
    setFieldValue(
      "data",
      values.data.filter((_, i) => i !== gIdx),
    );
    if (gIdx < currentActive) {
      setActiveKey(String(currentActive - 1));
    } else if (gIdx === currentActive) {
      setActiveKey(String(Math.max(0, gIdx - 1)));
    }
  };

  const updateGroupName = (gIdx: number, value: string) => {
    const data = JSON.parse(JSON.stringify(values.data));
    data[gIdx].group = value;
    setFieldValue("data", data);
  };

  const addQuestion = (gIdx: number) => {
    const data = JSON.parse(JSON.stringify(values.data));
    data[gIdx].questions = [...data[gIdx].questions, emptyQuestion()];
    setFieldValue("data", data);
  };

  const removeQuestion = (gIdx: number, qIdx: number) => {
    const data = JSON.parse(JSON.stringify(values.data));
    data[gIdx].questions = data[gIdx].questions.filter(
      (_: any, i: number) => i !== qIdx,
    );
    setFieldValue("data", data);
  };

  const updateQuestion = (
    gIdx: number,
    qIdx: number,
    field: string,
    value: any,
  ) => {
    const data = JSON.parse(JSON.stringify(values.data));
    data[gIdx].questions[qIdx][field] = value;
    if (
      field === "type" &&
      value !== "options" &&
      value !== "options-multiple"
    ) {
      data[gIdx].questions[qIdx].options = [];
    }
    setFieldValue("data", data);
  };

  const groupErrors: any[] = (errors as any).data ?? [];

  return (
    <>
      <div className="form-row" style={{ flex: 1 }}>
        <div className="form-label">
          <label>ID:</label>
        </div>
        <div className="form-input">
          <Input
            value={values.id ?? ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFieldValue("id", e.target.value)
            }
            placeholder="identificador-unico"
          />
        </div>
      </div>
      <div className="form-row" style={{ flex: 1 }}>
        <div className="form-label">
          <label>Nome do formulário:</label>
        </div>
        <div className="form-input">
          <Input
            value={values.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFieldValue("name", e.target.value)
            }
            placeholder="Nome do formulário"
          />
        </div>
        {(errors as any).name && (
          <div className="form-error">{(errors as any).name}</div>
        )}
      </div>

      <div
        className="form-row"
        style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
      >
        <div className="form-label" style={{ marginBottom: 0 }}>
          <label>Ativo:</label>
        </div>
        <Switch
          checked={values.active !== false}
          onChange={(val) => setFieldValue("active", val)}
        />
      </div>

      <Divider />

      <Tabs
        activeKey={activeKey}
        onChange={setActiveKey}
        tabBarExtraContent={
          <Button icon={<PlusOutlined />} onClick={addGroup}>
            Adicionar Grupo
          </Button>
        }
        items={values.data.map((g, gIdx) => ({
          key: String(gIdx),
          label: g.group || `Grupo ${gIdx + 1}`,
          children: (
            <GroupContainer>
              <GroupHeader>
                <div className="group-name-field">
                  <div className="form-label">
                    <label>Grupo:</label>
                  </div>
                  <div className="form-input">
                    <Input
                      value={g.group}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateGroupName(gIdx, e.target.value)
                      }
                      placeholder="Nome do grupo"
                    />
                  </div>
                  {groupErrors[gIdx]?.group && (
                    <div className="form-error">{groupErrors[gIdx].group}</div>
                  )}
                </div>
                {values.data.length > 1 && (
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeGroup(gIdx)}
                  >
                    Remover Grupo
                  </Button>
                )}
              </GroupHeader>

              {g.questions.map((q, qIdx) => {
                const qErrors = groupErrors[gIdx]?.questions?.[qIdx] ?? {};
                const showOptions =
                  q.type === "options" || q.type === "options-multiple";

                return (
                  <QuestionCard key={qIdx}>
                    <div className="form-row">
                      <div className="form-label">
                        <label>ID:</label>
                      </div>
                      <div className="form-input">
                        <Input
                          value={q.id}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            updateQuestion(gIdx, qIdx, "id", e.target.value)
                          }
                          placeholder="identificador-unico"
                        />
                      </div>
                      {qErrors.id && (
                        <div className="form-error">{qErrors.id}</div>
                      )}
                    </div>

                    <div className="form-row">
                      <div className="form-label">
                        <label>Pergunta:</label>
                      </div>
                      <div className="form-input">
                        <Input
                          value={q.label}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            updateQuestion(gIdx, qIdx, "label", e.target.value)
                          }
                          placeholder="Texto da pergunta"
                        />
                      </div>
                      {qErrors.label && (
                        <div className="form-error">{qErrors.label}</div>
                      )}
                    </div>

                    <div className="form-row form-row-flex">
                      <div className="form-row">
                        <div className="form-label">
                          <label>Tipo:</label>
                        </div>
                        <div className="form-input">
                          <Select
                            value={q.type}
                            onChange={(value: any) =>
                              updateQuestion(gIdx, qIdx, "type", value)
                            }
                            options={questionTypeOptions}
                          />
                        </div>
                      </div>
                    </div>

                    {showOptions && (
                      <div className="form-row">
                        <div className="form-label">
                          <label>Opções:</label>
                        </div>
                        <div className="form-input">
                          <Select
                            mode="tags"
                            value={q.options ?? []}
                            onChange={(value: any) =>
                              updateQuestion(gIdx, qIdx, "options", value)
                            }
                            tokenSeparators={[","]}
                            placeholder="Digite e pressione Enter para adicionar opções"
                            notFoundContent={null}
                          />
                        </div>
                      </div>
                    )}

                    <div className="form-row">
                      <Button
                        danger
                        block
                        icon={<DeleteOutlined />}
                        onClick={() => removeQuestion(gIdx, qIdx)}
                        disabled={g.questions.length === 1}
                      >
                        Remover Questão
                      </Button>
                    </div>
                  </QuestionCard>
                );
              })}

              <div style={{ marginTop: "0.75rem" }}>
                <Button
                  block
                  icon={<PlusOutlined />}
                  onClick={() => addQuestion(gIdx)}
                >
                  Adicionar Questão
                </Button>
              </div>
            </GroupContainer>
          ),
        }))}
      />
    </>
  );
}

export function CustomFormEditor({
  open,
  initialForm,
  isSaving,
  onSave,
  onCancel,
}: CustomFormEditorProps) {
  const validationSchema = Yup.object().shape({
    name: Yup.string().nullable().required("Campo obrigatório"),
    data: Yup.array()
      .min(1, "Ao menos um grupo é necessário")
      .of(
        Yup.object().shape({
          group: Yup.string().nullable().required("Campo obrigatório"),
          questions: Yup.array()
            .min(1, "Ao menos uma questão é necessária")
            .of(
              Yup.object().shape({
                id: Yup.string().nullable().required("Campo obrigatório"),
                label: Yup.string().nullable().required("Campo obrigatório"),
              }),
            ),
        }),
      ),
  });

  const initialValues: CustomForm = initialForm
    ? JSON.parse(JSON.stringify(initialForm))
    : emptyForm();

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSave}
      validateOnChange={false}
      validateOnBlur={false}
    >
      {({ handleSubmit }) => (
        <DefaultModal
          open={open}
          width={1000}
          centered
          destroyOnHidden
          onCancel={onCancel}
          onOk={handleSubmit}
          okText="Salvar"
          cancelText="Cancelar"
          confirmLoading={isSaving}
          okButtonProps={{ disabled: isSaving }}
          cancelButtonProps={{ disabled: isSaving }}
          maskClosable={false}
        >
          <header>
            <h2 className="modal-title">
              {initialForm
                ? initialForm.name || "Editar Formulário"
                : "Novo Formulário"}
            </h2>
          </header>

          <Form onSubmit={handleSubmit}>
            <FormBody />
          </Form>
        </DefaultModal>
      )}
    </Formik>
  );
}
