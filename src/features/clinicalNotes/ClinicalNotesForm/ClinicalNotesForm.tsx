import { useEffect, useRef } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { Alert, Spin } from "antd";

import { useAppSelector, useAppDispatch } from "src/store";
import DefaultModal from "components/Modal";
import notification from "components/notification";
import { SIGNATURE_STORE_ID, SIGNATURE_MEMORY_TYPE } from "utils/memory";
import { getErrorMessage } from "utils/errorHandler";
import { Form } from "styles/Form.style";
import { memoryFetchThunk } from "store/ducks/memory/thunk";

import Base from "components/Forms/ClinicalNotes/Base";
import {
  upsertClinicalNote,
  fetchClinicalNotesByPrescription,
  setFormModalClose,
  IClinicalNotesUpsertParams,
} from "../ClinicalNotesSlice";

const validationSchema = Yup.object().shape({
  idPrescription: Yup.number().required(),
  notes: Yup.string().nullable().required("Campo obrigatório"),
  hasConciliation: Yup.boolean(),
  hasClinicalNotesType: Yup.boolean(),
  concilia: Yup.string()
    .nullable()
    .when("hasConciliation", {
      is: true,
      then: Yup.string().required("Campo obrigatório"),
    }),
  notesType: Yup.string()
    .nullable()
    .when("hasClinicalNotesType", {
      is: true,
      then: Yup.string().nullable().required("Campo obrigatório"),
    }),
});

interface IClinicalNotesFormProps {
  afterSave?: () => void;
  onCancel?: () => void;
}

export function ClinicalNotesForm({
  afterSave,
  onCancel,
}: IClinicalNotesFormProps) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const formModal = useAppSelector(
    (state) => state.clinicalNotesMulti.formModal,
  );
  const listModal = useAppSelector(
    (state) => state.clinicalNotesMulti.listModal,
  );
  const saveStatus = useAppSelector(
    (state) => state.clinicalNotesMulti.save.status,
  );
  const prescriptionData = useAppSelector(
    (state) => (state.prescriptions as any).single,
  );
  const account = useAppSelector((state) => (state.user as any).account);
  const signature = useAppSelector((state) => (state.memory as any).signature);

  const { open, selectedNote } = formModal;

  useEffect(() => {
    if (open) {
      dispatch(
        (memoryFetchThunk as any)(
          SIGNATURE_STORE_ID,
          `${SIGNATURE_MEMORY_TYPE}_${account?.userId}`,
        ),
      ).catch((err: any) => {
        console.error("Error fetching signature memory:", err);
      });
    }
  }, [open, account?.userId, dispatch]);

  const initialValues = {
    formId: "clinicalNotesMulti",
    idPrescription: prescriptionData?.data?.idPrescription,
    admissionNumber: prescriptionData?.data?.admissionNumber,
    notes: selectedNote?.notes ?? "",
    concilia:
      selectedNote?.concilia ??
      (prescriptionData?.data?.concilia &&
      prescriptionData?.data?.concilia === "s"
        ? ""
        : prescriptionData?.data?.concilia),
    notesType:
      selectedNote?.notesType ?? prescriptionData?.data?.notesType ?? null,
    hasConciliation: !!(
      selectedNote?.concilia ?? prescriptionData?.data?.concilia
    ),
    hasClinicalNotesType:
      prescriptionData?.data?.clinicalNotesTypes?.length > 0 &&
      !(selectedNote?.concilia ?? prescriptionData?.data?.concilia),
    action: "clinicalNote",
    date: null,
  };

  const prescriptionForBase = {
    ...prescriptionData,
    isSaving: saveStatus === "loading",
    data: {
      ...prescriptionData?.data,
      notes: selectedNote?.notes ?? prescriptionData?.data?.notes ?? "",
      notesType:
        selectedNote?.notesType ?? prescriptionData?.data?.notesType ?? null,
    },
  };

  const submit = (formData: typeof initialValues) => {
    const params: IClinicalNotesUpsertParams = {
      idPrescription: formData.idPrescription,
      texto: formData.notes,
      idTipoEvolucao: formData.notesType,
      concilia: formData.hasConciliation ? formData.concilia : undefined,
      tpStatus: 0,
    };

    if (selectedNote?.id) {
      params.id = selectedNote.id;
    }

    dispatch(upsertClinicalNote(params)).then((response: any) => {
      if (response.error) {
        notification.error({ message: getErrorMessage(response, t) });
      } else {
        notification.success({
          message: "Uhu! Evolução salva com sucesso! :)",
        });
        dispatch(setFormModalClose());
        if (listModal.idPrescription) {
          dispatch(fetchClinicalNotesByPrescription(listModal.idPrescription));
        }
        afterSave?.();
      }
    });
  };

  const handleCancel = () => {
    dispatch(setFormModalClose());
    onCancel?.();
  };

  const isSaving = saveStatus === "loading";
  const submitRef = useRef<() => void>(() => undefined);

  return (
    <DefaultModal
      width="50vw"
      centered
      destroyOnHidden
      open={open}
      onOk={() => submitRef.current()}
      onCancel={handleCancel}
      okText="Salvar"
      okType="primary"
      cancelText="Cancelar"
      confirmLoading={isSaving}
      okButtonProps={{
        disabled: isSaving,
        className: "gtm-bt-save-clinical-notes-multi",
      }}
      cancelButtonProps={{
        disabled: isSaving,
        className: "gtm-bt-cancel-clinical-notes-multi",
      }}
      maskClosable={false}
    >
      <Formik
        enableReinitialize
        onSubmit={submit}
        initialValues={initialValues}
        validationSchema={validationSchema}
      >
        {({ handleSubmit }) => {
          submitRef.current = handleSubmit as () => void;
          return (
            <>
              <header>
                <h2 className="modal-title">
                  {selectedNote ? "Editar Evolução" : "Nova Evolução"}
                </h2>
              </header>
              {prescriptionData?.data?.idPrescription ? (
                <Form>
                  <Base
                    prescription={prescriptionForBase}
                    account={account}
                    signature={signature}
                    action="clinicalNote"
                  />
                </Form>
              ) : (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <Spin />
                </div>
              )}
              {saveStatus === "failed" && (
                <Alert
                  type="error"
                  message="Erro ao salvar evolução. Tente novamente."
                  style={{ marginTop: 12 }}
                />
              )}
            </>
          );
        }}
      </Formik>
    </DefaultModal>
  );
}
