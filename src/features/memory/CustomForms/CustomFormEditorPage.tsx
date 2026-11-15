import { useEffect, useRef, useState } from "react";
import {
  Navigate,
  useParams,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Formik, useFormikContext } from "formik";
import * as Yup from "yup";
import { Button, ConfigProvider, Input, Popconfirm, Tabs, Tag } from "antd";
import { MaintainerGroup } from "components/MaintainerGroup/MaintainerGroup";
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
import { CustomTextBody } from "./CustomTextBody/CustomTextBody";
import { CustomTextPreview } from "./CustomTextPreview/CustomTextPreview";
import { validateCustomText } from "./customText";
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
  customText: Yup.mixed().test(
    "custom-text-rules",
    "Texto personalizado inválido",
    function () {
      const errors = validateCustomText(this.parent);
      if (errors.length === 0) return true;

      // Formik keeps one message per field: the ones of a field are joined
      const byPath = new Map<string, string[]>();
      errors.forEach(({ path, message }) => {
        byPath.set(path, [...(byPath.get(path) ?? []), message]);
      });

      throw new Yup.ValidationError(
        Array.from(byPath.entries()).map(([path, messages]) =>
          this.createError({ path, message: messages.join(" ") }),
        ),
      );
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
          onValuesChange={null}
        />
      </DefaultModal>
    </>
  );
}

/**
 * A failed save opens the tab holding the errors: the questions first (their
 * tab points at the field on its own, see FormBody), then the custom text.
 */
function useErrorTabFocus(setActiveTab: (tab: string) => void) {
  const { errors, isSubmitting } = useFormikContext<CustomForm>();
  const wasSubmitting = useRef(false);

  // a submit that fails validation ends (isSubmitting back to false) only
  // after its errors are set, so they are the ones of this attempt
  useEffect(() => {
    const failed = wasSubmitting.current && !isSubmitting;
    wasSubmitting.current = isSubmitting;
    if (!failed) return;

    const hasFormErrors = !!(errors as any).data || !!(errors as any).name;
    if (hasFormErrors) {
      setActiveTab("form");
    } else if ((errors as any).customText) {
      setActiveTab("text");
      notification.error({
        message: "Verifique o texto personalizado antes de salvar.",
      });
    }
  }, [isSubmitting, errors, setActiveTab]);
}

interface InnerPageProps {
  title: string;
  readOnly: boolean;
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
  readOnly,
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
  const [activeTab, setActiveTab] = useState("form");
  const { errors } = useFormikContext<CustomForm>();
  const customTextHasErrors = !!(errors as any).customText;
  const blockCount = values.customText?.blocks?.length ?? 0;
  useErrorTabFocus(setActiveTab);
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
          <h1 className="page-header-title" data-kb="customForms.editor.title">
            {title}
          </h1>
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
          {readOnly && (
            <Tag variant="outlined" style={{ verticalAlign: "middle" }}>
              Somente visualização
            </Tag>
          )}
          {dirty && !readOnly ? (
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
              {readOnly ? "Voltar" : "Cancelar"}
            </Button>
          )}
          {isMaintainer && !readOnly && (
            <MaintainerGroup>
              <Button icon={<CopyOutlined />} onClick={handleCopyJson}>
                Copiar JSON
              </Button>
              <Button
                icon={<UploadOutlined />}
                onClick={() => setJsonModalOpen(true)}
              >
                Carregar JSON
              </Button>
            </MaintainerGroup>
          )}
          <PreviewButton template={values.data} />
          <CustomTextPreview form={values} />
          {!readOnly && (
            <Button
              type="primary"
              loading={isSaving}
              disabled={isSaving}
              onClick={handleSubmit}
              danger={hasErrors}
            >
              Salvar
            </Button>
          )}
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

      <ConfigProvider componentDisabled={readOnly}>
        <Form onSubmit={handleSubmit}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: "form",
                label: "Formulário",
                children: <FormBody />,
              },
              {
                key: "text",
                label: (
                  <span
                    style={
                      customTextHasErrors ? { color: "#ff4d4f" } : undefined
                    }
                  >
                    Texto personalizado
                    {blockCount > 0 ? ` (${blockCount})` : ""}
                  </span>
                ),
                children: <CustomTextBody />,
              },
            ]}
          />
        </Form>
      </ConfigProvider>
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
  // READ_NAV alone (NAVIGATION_VIEWER) opens the form read-only
  const readOnly = !PermissionService().has(Permission.WRITE_CUSTOM_FORMS);

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

  if (readOnly && isNew) {
    return <Navigate to={listPath} replace />;
  }

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
          readOnly={readOnly}
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
