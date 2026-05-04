import { useEffect, useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { Button, Popconfirm, Tag } from "antd";
import { EyeOutlined } from "@ant-design/icons";

import DefaultModal from "components/Modal";
import CustomFormView from "components/Forms/CustomForm";
import { Form } from "styles/Form.style";
import { CustomForm, FormGroup, emptyForm } from "./types";
import { FormBody } from "./FormBody";

export type { CustomForm } from "./types";

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

interface CustomFormEditorProps {
  open: boolean;
  initialForm: CustomForm | null;
  isSaving: boolean;
  onSave: (form: CustomForm) => void;
  onCancel: () => void;
}

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
              formula: Yup.string()
                .nullable()
                .when("type", {
                  is: "calculated_field",
                  then: (s) => s.required("Campo obrigatório"),
                }),
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

export function CustomFormEditor({
  open,
  initialForm,
  isSaving,
  onSave,
  onCancel,
}: CustomFormEditorProps) {
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
      {({ handleSubmit, values, dirty, errors }) => (
        <DefaultModal
          open={open}
          width={1000}
          centered
          destroyOnHidden
          onCancel={onCancel}
          maskClosable={false}
          footer={[
            dirty ? (
              <Popconfirm
                key="cancel"
                title="Alterações não salvas"
                description="Deseja sair sem salvar?"
                onConfirm={onCancel}
                okText="Sair sem salvar"
                cancelText="Continuar editando"
                okButtonProps={{ danger: true }}
              >
                <Button disabled={isSaving}>Cancelar</Button>
              </Popconfirm>
            ) : (
              <Button key="cancel" onClick={onCancel} disabled={isSaving}>
                Cancelar
              </Button>
            ),
            <PreviewButton key="preview" template={values.data} />,
            <Button
              key="save"
              type="primary"
              loading={isSaving}
              disabled={isSaving}
              onClick={() => handleSubmit()}
            >
              Salvar
            </Button>,
          ]}
        >
          <DirtyGuard dirty={dirty} />
          <header>
            <h2 className="modal-title">
              {initialForm
                ? initialForm.name || "Editar Formulário"
                : "Novo Formulário"}
              {Object.keys(errors).length > 0 && (
                <Tag
                  color="error"
                  style={{ marginLeft: 8, verticalAlign: "middle" }}
                >
                  Formulário com erros
                </Tag>
              )}
              {dirty && (
                <Tag
                  color="warning"
                  style={{ marginLeft: 8, verticalAlign: "middle" }}
                >
                  Alterações não salvas
                </Tag>
              )}
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
