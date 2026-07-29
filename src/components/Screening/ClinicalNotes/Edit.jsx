import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Formik, useFormikContext } from "formik";
import * as Yup from "yup";
import { debounce } from "lodash";

import Button from "components/Button";
import { Row } from "components/Grid";
import CustomForm from "components/Forms/CustomForm";
import ScheduleForm from "components/Forms/ClinicalNotes/Base";
import DefaultModal from "components/Modal";

import { CustomFormContainer } from "components/Forms/Form.style";
import { getDraft, saveDraft, clearDraft } from "utils/clinicalNotesEditDraft";

// Warns the user before leaving (tab close / refresh) while there are
// unsaved changes. Mirrors the DirtyGuard pattern used in the custom-form editor.
function DirtyGuard({ dirty }) {
  useEffect(() => {
    if (!dirty) return;
    const handler = (e) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
  return null;
}

// The schedule (Agendamento) form uses Formik directly and has no value
// observer, so we add one here to feed the debounced draft autosave.
function ScheduleObserver({ onValuesChange }) {
  const { values } = useFormikContext();
  useEffect(() => {
    if (onValuesChange) onValuesChange(values);
  }, [values, onValuesChange]);
  return null;
}

export default function Edit({ clinicalNote, update, isSaving, setEdit }) {
  // Read any persisted draft for this note once, on mount.
  const [draft] = useState(() => getDraft(clinicalNote.id));
  const [useDraft, setUseDraft] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  // Autosave stays disabled until the restore decision is resolved, so the
  // form's initial value emissions never overwrite an existing draft.
  const canAutosaveRef = useRef(false);

  const debouncedSave = useMemo(
    () =>
      debounce((data) => {
        saveDraft(clinicalNote.id, data);
      }, 1200),
    [clinicalNote.id]
  );

  useEffect(() => {
    return () => debouncedSave.cancel();
  }, [debouncedSave]);

  useEffect(() => {
    if (draft) {
      const modal = DefaultModal.confirm({
        title: "Rascunho",
        content:
          "Existe um rascunho não salvo para esta evolução. Deseja recuperá-lo?",
        okText: "Sim",
        cancelText: "Não",
        onOk: () => {
          setUseDraft(true);
          setIsDirty(true);
          canAutosaveRef.current = true;
        },
        onCancel: () => {
          clearDraft(clinicalNote.id);
          canAutosaveRef.current = true;
        },
      });
      return () => modal.destroy();
    }

    canAutosaveRef.current = true;
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const guardedSave = useCallback(
    (data) => {
      if (!canAutosaveRef.current) return;
      setIsDirty(true);
      debouncedSave(data);
    },
    [debouncedSave]
  );

  // NOTE: draft.form holds raw Formik values (e.g. a "json" question is stored
  // as its editor string, whereas clinicalNote.form holds the parsed object).
  // Clinical-note templates don't expose a "json" question type (see
  // features/memory/CustomForms/types.ts), so both shapes coincide here; if a
  // json field is ever added to these templates, normalize it on save/restore.
  const handleCustomFormChange = useCallback(
    (values) => guardedSave({ form: values }),
    [guardedSave]
  );

  const handleCancel = () => {
    clearDraft(clinicalNote.id);
    setEdit(false);
  };

  const handleScheduleChange = useCallback(
    (values) => guardedSave({ text: values.notes, date: values.date }),
    [guardedSave]
  );

  const initialValuesSchedule = {
    id: clinicalNote.id,
    date: useDraft && draft?.date != null ? draft.date : clinicalNote.date,
    notes: useDraft && draft?.text != null ? draft.text : clinicalNote.text,
  };

  const customFormValues =
    useDraft && draft?.form != null ? draft.form : clinicalNote.form;

  const scheduleParams = {
    prescription: { data: { concilia: null } },
    action: "schedule",
    signature: { list: [] },
  };

  const validationSchema = Yup.object().shape({
    notes: Yup.string().nullable().required("Campo obrigatório"),
    date: Yup.string().nullable().required("Campo obrigatório"),
  });

  const submitSchedule = (values) => {
    update({
      id: clinicalNote.id,
      date: values.date,
      text: values.notes,
    });
  };

  const submitCustomForm = (form) => {
    update({
      id: clinicalNote.id,
      form: form.values,
    });
  };

  return (
    <>
      <DirtyGuard dirty={isDirty} />
      {clinicalNote.position === "Agendamento" ? (
        <Formik
          key={`schedule-${useDraft ? "draft" : "server"}`}
          enableReinitialize
          onSubmit={submitSchedule}
          initialValues={initialValuesSchedule}
          validationSchema={validationSchema}
        >
          {({ handleSubmit }) => (
            <CustomFormContainer>
              <ScheduleObserver onValuesChange={handleScheduleChange} />
              <Row type="flex" gutter={[16, 24]}>
                <ScheduleForm {...scheduleParams} />
              </Row>
              <div className="actions">
                <Button onClick={handleCancel} loading={isSaving}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => handleSubmit()}
                  type="primary"
                  loading={isSaving}
                >
                  Salvar
                </Button>
              </div>
            </CustomFormContainer>
          )}
        </Formik>
      ) : (
        <CustomForm
          key={`customform-${useDraft ? "draft" : "server"}`}
          onSubmit={submitCustomForm}
          onCancel={handleCancel}
          isSaving={isSaving}
          template={clinicalNote.template}
          values={customFormValues}
          startClosed={true}
          onValuesChange={handleCustomFormChange}
        />
      )}
    </>
  );
}
