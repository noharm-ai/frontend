import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Formik } from "formik";
import * as Yup from "yup";
import { Button, Input, Popconfirm, Tag } from "antd";
import { CopyOutlined, EyeOutlined, UploadOutlined } from "@ant-design/icons";

import { useAppDispatch, useAppSelector } from "src/store";
import DefaultModal from "components/Modal";
import CustomFormView from "components/Forms/CustomForm";
import notification from "components/notification";
import { getErrorMessage } from "utils/errorHandler";
import { PageHeader } from "styles/PageHeader.style";
import { Form } from "styles/Form.style";

import Permission from "models/Permission";
import PermissionService from "services/PermissionService";

import { fetchCustomForms, saveCustomForms, reset } from "./CustomFormsSlice";
import { FormBody } from "./FormBody";
import { CustomForm, FormGroup, emptyForm } from "./types";

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
    )
    .test(
      "unique-question-ids",
      "IDs das questões devem ser únicos",
      function (data) {
        if (!data) return true;

        const idPositions: Record<
          string,
          Array<{ gIdx: number; qIdx: number }>
        > = {};

        data.forEach((group, gIdx) => {
          (group.questions ?? []).forEach((q: any, qIdx: number) => {
            if (q.id) {
              if (!idPositions[q.id]) idPositions[q.id] = [];
              idPositions[q.id].push({ gIdx, qIdx });
            }
          });
        });

        const duplicateErrors = Object.values(idPositions)
          .filter((positions) => positions.length > 1)
          .flatMap((positions) =>
            positions.map(({ gIdx, qIdx }) =>
              this.createError({
                path: `data[${gIdx}].questions[${qIdx}].id`,
                message: "ID duplicado",
              }),
            ),
          );

        if (duplicateErrors.length > 0) {
          throw new Yup.ValidationError(duplicateErrors);
        }

        return true;
      },
    ),
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

function PreviewButton({ template }: { template: FormGroup[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button icon={<EyeOutlined />} onClick={() => setOpen(true)}>
        Pré-visualizar
      </Button>
      <DefaultModal
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        title="Pré-visualização"
        width={800}
        centered
        destroyOnHidden
      >
        <CustomFormView
          template={template}
          values={{}}
          onSubmit={() => setOpen(false)}
          onCancel={() => setOpen(false)}
          onChange={() => {}}
          isSaving={false}
          startClosed={false}
          horizontal={false}
          btnSaveText={"Fechar preview"}
        />
      </DefaultModal>
    </>
  );
}

interface InnerPageProps {
  title: string;
  dirty: boolean;
  hasErrors: boolean;
  isSaving: boolean;
  values: any;
  setValues: (values: CustomForm) => void;
  handleSubmit: () => void;
  handleCancel: () => void;
}

function InnerPage({
  title,
  dirty,
  hasErrors,
  isSaving,
  values,
  setValues,
  handleSubmit,
  handleCancel,
}: InnerPageProps) {
  const [jsonModalOpen, setJsonModalOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const isMaintainer = PermissionService().has(Permission.MAINTAINER);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(values, null, 2));
    notification.success({ message: "JSON copiado!" });
  };

  const handleLoadJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setValues(parsed);
      setJsonModalOpen(false);
      setJsonInput("");
    } catch {
      notification.error({ message: "JSON inválido" });
    }
  };

  return (
    <>
      <DirtyGuard dirty={dirty} />
      <PageHeader>
        <div>
          <h1 className="page-header-title">{title}</h1>
          <div className="page-header-legend">Formulários de evolução</div>
        </div>
        <div className="page-header-actions">
          {hasErrors && (
            <Tag
              color="error"
              variant="outlined"
              style={{ marginLeft: 8, verticalAlign: "middle" }}
            >
              Formulário com erros
            </Tag>
          )}
          {dirty ? (
            <>
              <Tag
                color="warning"
                variant="outlined"
                style={{ marginLeft: 8, verticalAlign: "middle" }}
              >
                Alterações não salvas
              </Tag>

              <Popconfirm
                title="Alterações não salvas"
                description="Deseja sair sem salvar?"
                onConfirm={handleCancel}
                okText="Sair sem salvar"
                cancelText="Continuar editando"
                okButtonProps={{ danger: true }}
              >
                <Button disabled={isSaving}>Cancelar</Button>
              </Popconfirm>
            </>
          ) : (
            <Button onClick={handleCancel} disabled={isSaving}>
              Cancelar
            </Button>
          )}
          {isMaintainer && (
            <>
              <Button icon={<CopyOutlined />} onClick={handleCopyJson}>
                Copiar JSON
              </Button>
              <Button
                icon={<UploadOutlined />}
                onClick={() => setJsonModalOpen(true)}
              >
                Carregar JSON
              </Button>
            </>
          )}
          <PreviewButton template={values.data} />
          <Button
            type="primary"
            loading={isSaving}
            disabled={isSaving}
            onClick={handleSubmit}
            danger={hasErrors}
          >
            Salvar
          </Button>
        </div>
      </PageHeader>

      <DefaultModal
        open={jsonModalOpen}
        title="Carregar definição JSON"
        onCancel={() => {
          setJsonModalOpen(false);
          setJsonInput("");
        }}
        onOk={handleLoadJson}
        okText="Carregar"
        cancelText="Cancelar"
        width={700}
        destroyOnHidden
      >
        <Input.TextArea
          rows={16}
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder='{"name": "...", "data": [...]}'
          style={{ fontFamily: "monospace", fontSize: 12 }}
        />
      </DefaultModal>

      <Form onSubmit={handleSubmit}>
        <FormBody />
      </Form>
    </>
  );
}

function CustomFormEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const copyFromKey = searchParams.get("copyFrom");
  const { t } = useTranslation();
  const dispatch = useAppDispatch() as any;

  const forms: any[] = useAppSelector(
    (state: any) => state.memoryCustomForms.forms,
  );
  const saveStatus = useAppSelector(
    (state: any) => state.memoryCustomForms.saveStatus,
  );
  const isSaving = saveStatus === "loading";

  useEffect(() => {
    dispatch(fetchCustomForms());
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  const isNew = id === "new";
  const formRecord = isNew
    ? null
    : forms.find((f: any) => String(f.key) === id);

  const initialForm: CustomForm = (() => {
    if (isNew && copyFromKey) {
      const source = forms.find((f: any) => String(f.key) === copyFromKey);
      if (source) {
        const copy = JSON.parse(JSON.stringify(source.value));
        copy.name = `Cópia de ${copy.name}`;
        return copy;
      }
    }
    return formRecord
      ? JSON.parse(JSON.stringify(formRecord.value))
      : emptyForm();
  })();

  const listPath = "/configuracoes/forms-personalizados";

  const handleSave = (form: CustomForm) => {
    const formId = isNew ? undefined : formRecord?.key;
    dispatch(
      saveCustomForms({ id: formId, type: "custom-forms", value: form }),
    ).then((response: any) => {
      if (response.error) {
        notification.error({ message: getErrorMessage(response, t) });
      } else {
        notification.success({ message: t("success.generic") });
        navigate(listPath);
      }
    });
  };

  const handleCancel = () => {
    navigate(listPath);
  };

  const title = isNew
    ? "Novo Formulário"
    : formRecord?.value?.name || "Editar Formulário";

  return (
    <Formik
      enableReinitialize
      initialValues={initialForm}
      validationSchema={validationSchema}
      onSubmit={handleSave}
      validateOnChange={false}
      validateOnBlur={false}
    >
      {({ handleSubmit, values, dirty, errors, setValues }) => (
        <InnerPage
          title={title}
          dirty={dirty}
          hasErrors={Object.keys(errors).length > 0}
          isSaving={isSaving}
          values={values}
          setValues={setValues}
          handleSubmit={handleSubmit}
          handleCancel={handleCancel}
        />
      )}
    </Formik>
  );
}

export default CustomFormEditorPage;
