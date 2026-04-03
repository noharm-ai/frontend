import { useEffect } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { Input, Tabs, Switch, Popconfirm, Tag } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";

import Button from "components/Button";
import { PageHeader } from "styles/PageHeader.style";
import { Form } from "styles/Form.style";
import { PageCard } from "styles/Utils.style";
import type { KindEditorProps } from "features/memory/MemoryList/types";

import EditorBase from "components/Editor";
const Editor = EditorBase as any;

import {
  emptyTemplate,
  emptySnippetCategory,
  emptySnippetItem,
  withIds,
  stripIds,
  type TemplateWithId,
  type SnippetCategoryWithId,
} from "./types";
import {
  EditorCard,
  CardHeader,
  SnippetItemRow,
  CategoryContainer,
  CategoryHeader,
} from "./TplCarePlanEditor.style";

const validationSchema = Yup.object().shape({
  name: Yup.string().nullable().required("Campo obrigatório"),
  data: Yup.object().shape({
    templates: Yup.array()
      .min(1, "Ao menos um modelo é necessário")
      .of(
        Yup.object().shape({
          title: Yup.string().nullable().required("Campo obrigatório"),
          content: Yup.string().nullable().required("Campo obrigatório"),
        }),
      ),
    snippets: Yup.array()
      .min(1, "Ao menos uma categoria é necessária")
      .of(
        Yup.object().shape({
          category: Yup.string().nullable().required("Campo obrigatório"),
          items: Yup.array()
            .min(1, "Ao menos um texto é necessário")
            .of(
              Yup.object().shape({
                title: Yup.string().nullable().required("Campo obrigatório"),
                text: Yup.string().nullable().required("Campo obrigatório"),
              }),
            ),
        }),
      ),
  }),
});

function DirtyGuard({ dirty }: { dirty: boolean }) {
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
  return null;
}

function TplCarePlanEditorInner({
  recordValue,
  isSaving,
  onSave,
  onCancel,
}: KindEditorProps) {
  const initialValues = {
    name: recordValue?.name ?? "",
    active: recordValue?.active !== false,
    kind: recordValue?.kind ?? "tpl-care-plan",
    data: withIds(recordValue?.data as any),
  };

  const handleSubmit = (values: typeof initialValues) => {
    onSave({
      name: values.name,
      active: values.active,
      kind: values.kind,
      data: stripIds(values.data),
    });
  };

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      validateOnChange={false}
      validateOnBlur={false}
    >
      {({ values, errors, dirty, handleSubmit, setFieldValue }) => {
        const templates = values.data.templates as TemplateWithId[];
        const snippets = values.data.snippets as SnippetCategoryWithId[];

        const addTemplate = () => {
          setFieldValue("data.templates", [...templates, emptyTemplate()]);
        };

        const removeTemplate = (idx: number) => {
          setFieldValue(
            "data.templates",
            templates.filter((_, i) => i !== idx),
          );
        };

        const setTemplateField = (idx: number, field: string, value: any) => {
          const updated = templates.map((t, i) =>
            i === idx ? { ...t, [field]: value } : t,
          );
          setFieldValue("data.templates", updated);
        };

        const addCategory = () => {
          setFieldValue("data.snippets", [...snippets, emptySnippetCategory()]);
        };

        const removeCategory = (catIdx: number) => {
          setFieldValue(
            "data.snippets",
            snippets.filter((_, i) => i !== catIdx),
          );
        };

        const setCategoryField = (
          catIdx: number,
          field: string,
          value: any,
        ) => {
          const updated = snippets.map((s, i) =>
            i === catIdx ? { ...s, [field]: value } : s,
          );
          setFieldValue("data.snippets", updated);
        };

        const addItem = (catIdx: number) => {
          const updated = snippets.map((s, i) =>
            i === catIdx
              ? { ...s, items: [...s.items, emptySnippetItem()] }
              : s,
          );
          setFieldValue("data.snippets", updated);
        };

        const removeItem = (catIdx: number, itemIdx: number) => {
          const updated = snippets.map((s, i) =>
            i === catIdx
              ? {
                  ...s,
                  items: s.items.filter((_, j) => j !== itemIdx),
                }
              : s,
          );
          setFieldValue("data.snippets", updated);
        };

        const setItemField = (
          catIdx: number,
          itemIdx: number,
          field: string,
          value: any,
        ) => {
          const updated = snippets.map((s, i) =>
            i === catIdx
              ? {
                  ...s,
                  items: s.items.map((item, j) =>
                    j === itemIdx ? { ...item, [field]: value } : item,
                  ),
                }
              : s,
          );
          setFieldValue("data.snippets", updated);
        };

        const hasErrors = Object.keys(errors).length > 0;

        const templateErrors = (errors as any)?.data?.templates;
        const snippetErrors = (errors as any)?.data?.snippets;

        const tabItems = [
          {
            key: "templates",
            label: `Modelos (${templates.length})`,
            children: (
              <>
                {templates.map((tpl, idx) => {
                  const tplErr = Array.isArray(templateErrors)
                    ? templateErrors[idx]
                    : undefined;
                  return (
                    <EditorCard key={tpl._id}>
                      <CardHeader>
                        <span className="card-title">Modelo {idx + 1}</span>
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          disabled={templates.length <= 1}
                          onClick={() => removeTemplate(idx)}
                        />
                      </CardHeader>
                      <div className={`form-row ${tplErr?.title ? "error" : ""}`}>
                        <div className="form-label">
                          <label>Título *</label>
                        </div>
                        <div className="form-input">
                          <Input
                            value={tpl.title}
                            onChange={(e) =>
                              setTemplateField(idx, "title", e.target.value)
                            }
                            placeholder="Título do modelo"
                          />
                        </div>
                        {tplErr?.title && (
                          <div className="form-error">{tplErr.title}</div>
                        )}
                      </div>
                      <div className="form-row">
                        <div className="form-label">
                          <label>Descrição</label>
                        </div>
                        <div className="form-input">
                          <Input
                            value={tpl.description}
                            onChange={(e) =>
                              setTemplateField(idx, "description", e.target.value)
                            }
                            placeholder="Breve descrição do modelo"
                          />
                        </div>
                      </div>
                      <div className={`form-row ${tplErr?.content ? "error" : ""}`}>
                        <div className="form-label">
                          <label>Conteúdo *</label>
                        </div>
                        <div className="form-input">
                          <Editor
                            content={tpl.content}
                            onEdit={(html: string | null) =>
                              setTemplateField(idx, "content", html ?? "")
                            }
                            utilities={["basic"]}
                          />
                        </div>
                        {tplErr?.content && (
                          <div className="form-error">{tplErr.content}</div>
                        )}
                      </div>
                    </EditorCard>
                  );
                })}
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={addTemplate}
                  style={{ width: "100%" }}
                >
                  Adicionar modelo
                </Button>
              </>
            ),
          },
          {
            key: "snippets",
            label: `Textos (${snippets.length})`,
            children: (
              <>
                {snippets.map((cat, catIdx) => {
                  const catErr = Array.isArray(snippetErrors)
                    ? snippetErrors[catIdx]
                    : undefined;
                  return (
                    <CategoryContainer key={cat._id}>
                      <CategoryHeader>
                        <Input
                          className="category-input"
                          value={cat.category}
                          onChange={(e) =>
                            setCategoryField(catIdx, "category", e.target.value)
                          }
                          placeholder="Nome da categoria"
                        />
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          disabled={snippets.length <= 1}
                          onClick={() => removeCategory(catIdx)}
                        />
                      </CategoryHeader>
                      {catErr?.category && (
                        <div className="form-error">{catErr.category}</div>
                      )}

                      {cat.items.map((item, itemIdx) => {
                        const itemErr = Array.isArray(catErr?.items)
                          ? catErr.items[itemIdx]
                          : undefined;
                        return (
                          <div key={item._id}>
                            <SnippetItemRow>
                              <Input
                                value={item.title}
                                onChange={(e) =>
                                  setItemField(
                                    catIdx,
                                    itemIdx,
                                    "title",
                                    e.target.value,
                                  )
                                }
                                placeholder="Título"
                                style={{ width: 200 }}
                              />
                              <div style={{ flex: 1 }}>
                                <Editor
                                  content={item.text}
                                  onEdit={(html: string | null) =>
                                    setItemField(
                                      catIdx,
                                      itemIdx,
                                      "text",
                                      html ?? "",
                                    )
                                  }
                                  utilities={["basic"]}
                                />
                              </div>
                              <Button
                                icon={<DeleteOutlined />}
                                disabled={cat.items.length <= 1}
                                onClick={() => removeItem(catIdx, itemIdx)}
                              />
                            </SnippetItemRow>
                            {(itemErr?.title || itemErr?.text) && (
                              <div className="form-error">
                                {itemErr.title || itemErr.text}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      <Button
                        type="dashed"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => addItem(catIdx)}
                        style={{ marginTop: 4 }}
                      >
                        Adicionar texto
                      </Button>
                    </CategoryContainer>
                  );
                })}
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={addCategory}
                  style={{ width: "100%" }}
                >
                  Adicionar categoria
                </Button>
              </>
            ),
          },
        ];

        return (
          <>
            <DirtyGuard dirty={dirty} />
            <PageHeader>
              <div>
                <h1 className="page-header-title">
                  Modelo de Plano de Cuidado
                </h1>
                <div className="page-header-legend">
                  Registro de textos padrão
                </div>
              </div>
              <div className="page-header-actions">
                {hasErrors && (
                  <Tag color="error" variant="outlined">
                    Formulário com erros
                  </Tag>
                )}
                {dirty ? (
                  <>
                    <Tag color="warning" variant="outlined">
                      Alterações não salvas
                    </Tag>
                    <Popconfirm
                      title="Alterações não salvas"
                      description="Deseja sair sem salvar?"
                      onConfirm={onCancel}
                      okText="Sair sem salvar"
                      cancelText="Continuar editando"
                      okButtonProps={{ danger: true }}
                    >
                      <Button disabled={isSaving}>Cancelar</Button>
                    </Popconfirm>
                  </>
                ) : (
                  <Button onClick={onCancel} disabled={isSaving}>
                    Cancelar
                  </Button>
                )}
                <Button
                  type="primary"
                  loading={isSaving}
                  disabled={isSaving}
                  onClick={() => handleSubmit()}
                  danger={hasErrors}
                >
                  Salvar
                </Button>
              </div>
            </PageHeader>

            <PageCard>
              <Form onSubmit={() => handleSubmit()}>
                <div className="form-row form-row-flex">
                  <div className={`form-row ${(errors as any).name ? "error" : ""}`}>
                    <div className="form-label">
                      <label>Nome *</label>
                    </div>
                    <div className="form-input">
                      <Input
                        value={values.name}
                        onChange={(e) => setFieldValue("name", e.target.value)}
                        placeholder="Nome do registro"
                      />
                    </div>
                    {(errors as any).name && (
                      <div className="form-error">{(errors as any).name}</div>
                    )}
                  </div>
                  <div className="form-row">
                    <div className="form-label">
                      <label>Ativo</label>
                    </div>
                    <div className="form-input">
                      <Switch
                        checked={values.active}
                        onChange={(checked) => setFieldValue("active", checked)}
                      />
                    </div>
                  </div>
                </div>

                <Tabs items={tabItems} />
              </Form>
            </PageCard>
          </>
        );
      }}
    </Formik>
  );
}

export default TplCarePlanEditorInner;
