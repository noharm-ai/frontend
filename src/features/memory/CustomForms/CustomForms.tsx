import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Space, Popconfirm, Tag } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

import { useAppDispatch, useAppSelector } from "src/store";
import Table from "components/Table";
import Button from "components/Button";
import BackTop from "components/BackTop";
import notification from "components/notification";
import { getErrorMessage } from "utils/errorHandler";
import { PageCard } from "styles/Utils.style";
import { PageHeader } from "styles/PageHeader.style";

import { fetchCustomForms, saveCustomForms, reset } from "./CustomFormsSlice";
import { CustomFormEditor, CustomForm } from "./CustomFormEditor";

function MemoryCustomForms() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch() as any;
  const id = useAppSelector((state: any) => state.memoryCustomForms.id);
  const forms: CustomForm[] = useAppSelector(
    (state: any) => state.memoryCustomForms.forms,
  );
  const status = useAppSelector((state: any) => state.memoryCustomForms.status);
  const saveStatus = useAppSelector(
    (state: any) => state.memoryCustomForms.saveStatus,
  );
  const loading = status === "loading" || saveStatus === "loading";

  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchCustomForms());
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  if (status === "failed") {
    notification.error({
      message: t("error.title"),
      description: t("error.description"),
    });
  }

  const openNew = () => {
    setEditIndex(null);
    setEditorOpen(true);
  };

  const openEditor = (index: number) => {
    setEditIndex(index);
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
  };

  const saveArray = (value: CustomForm[]) => {
    dispatch(saveCustomForms({ id, kind: "custom-forms", value })).then(
      (response: any) => {
        if (response.error) {
          notification.error({ message: getErrorMessage(response, t) });
        } else {
          notification.success({ message: t("success.generic") });
          setEditorOpen(false);
          dispatch(fetchCustomForms());
        }
      },
    );
  };

  const handleEditorSave = (form: CustomForm) => {
    const updated =
      editIndex === null
        ? [...forms, form]
        : forms.map((f, i) => (i === editIndex ? form : f));
    saveArray(updated);
  };

  const deleteForm = (index: number) => {
    saveArray(forms.filter((_, i) => i !== index));
  };

  const columns = [
    {
      title: "Nome",
      dataIndex: "name",
    },
    {
      title: "Ativo",
      align: "center" as const,
      width: 90,
      render: (_: any, record: any) =>
        record.active !== false ? (
          <Tag color="green">Sim</Tag>
        ) : (
          <Tag color="red">Não</Tag>
        ),
    },
    {
      title: "Grupos",
      align: "center" as const,
      width: 100,
      render: (_: any, record: any) => record.data?.length ?? 0,
    },
    {
      title: "Questões",
      align: "center" as const,
      width: 100,
      render: (_: any, record: any) =>
        (record.data ?? []).reduce(
          (acc: number, g: any) => acc + (g.questions?.length ?? 0),
          0,
        ),
    },
    {
      title: "Ações",
      key: "operations",
      width: 120,
      align: "center" as const,
      render: (_: any, _record: any, index: number) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => openEditor(index)}
          />
          <Popconfirm
            title="Remover formulário?"
            onConfirm={() => deleteForm(index)}
            okText="Sim"
            cancelText="Não"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">Formulários Personalizados</h1>
          <div className="page-header-legend">
            Crie e edite formulários personalizados
          </div>
        </div>
        <div className="page-header-actions">
          <Button type="primary" icon={<PlusOutlined />} onClick={openNew}>
            Adicionar formulário
          </Button>
        </div>
      </PageHeader>

      <PageCard>
        <Table
          columns={columns}
          dataSource={forms.map((f: any, i: number) => ({
            ...f.value,
            key: i,
          }))}
          loading={status === "loading"}
          pagination={false}
          locale={{ emptyText: "Nenhum formulário cadastrado" }}
        />
      </PageCard>

      <CustomFormEditor
        open={editorOpen}
        initialForm={
          editIndex !== null ? (forms[editIndex] as any).value : null
        }
        isSaving={loading}
        onSave={handleEditorSave}
        onCancel={closeEditor}
      />

      <BackTop />
    </>
  );
}

export default MemoryCustomForms;
