import { Formik } from "formik";
import * as Yup from "yup";

import DefaultModal from "components/Modal";
import { Form } from "styles/Form.style";
import { CustomForm, emptyForm } from "./types";
import { FormBody } from "./FormBody";

export type { CustomForm } from "./types";

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
      {({ handleSubmit }) => (
        <DefaultModal
          open={open}
          width={1000}
          centered
          destroyOnHidden
          onCancel={onCancel}
          onOk={() => handleSubmit()}
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
