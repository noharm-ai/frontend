import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Formik } from "formik";
import * as Yup from "yup";
import { Button } from "antd";
import { useState } from "react";
import { EyeOutlined } from "@ant-design/icons";

import { useAppDispatch, useAppSelector } from "src/store";
import DefaultModal from "components/Modal";
import CustomFormView from "components/Forms/CustomForm";
import notification from "components/notification";
import { getErrorMessage } from "utils/errorHandler";
import { PageHeader } from "styles/PageHeader.style";
import { Form } from "styles/Form.style";

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

function CustomFormEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
  const initialForm: CustomForm = formRecord
    ? JSON.parse(JSON.stringify(formRecord.value))
    : emptyForm();

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
      {({ handleSubmit, values }) => (
        <>
          <PageHeader>
            <div>
              <h1 className="page-header-title">{title}</h1>
              <div className="page-header-legend">Formulários de evolução</div>
            </div>
            <div className="page-header-actions">
              <Button onClick={handleCancel} disabled={isSaving}>
                Cancelar
              </Button>
              <PreviewButton template={values.data} />
              <Button
                type="primary"
                loading={isSaving}
                disabled={isSaving}
                onClick={() => handleSubmit()}
              >
                Salvar
              </Button>
            </div>
          </PageHeader>

          <Form onSubmit={handleSubmit}>
            <FormBody />
          </Form>
        </>
      )}
    </Formik>
  );
}

export default CustomFormEditorPage;
