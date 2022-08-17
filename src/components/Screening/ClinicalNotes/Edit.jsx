import React from "react";
import { Formik } from "formik";
import * as Yup from "yup";

import Button from "components/Button";
import { Row } from "components/Grid";
import CustomForm from "components/Forms/CustomForm";
import ScheduleForm from "components/Forms/ClinicalNotes/Base";

import { CustomFormContainer } from "components/Forms/Form.style";

export default function Edit({ clinicalNote, update, isSaving, setEdit }) {
  const initialValuesSchedule = {
    id: clinicalNote.id,
    date: clinicalNote.date,
    notes: clinicalNote.text,
  };

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
      {clinicalNote.position === "Agendamento" ? (
        <Formik
          enableReinitialize
          onSubmit={submitSchedule}
          initialValues={initialValuesSchedule}
          validationSchema={validationSchema}
        >
          {({ handleSubmit }) => (
            <CustomFormContainer>
              <Row type="flex" gutter={[16, 24]}>
                <ScheduleForm {...scheduleParams} />
              </Row>
              <div className="actions">
                <Button onClick={() => setEdit(false)} loading={isSaving}>
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
          onSubmit={submitCustomForm}
          onCancel={() => setEdit(false)}
          isSaving={isSaving}
          template={clinicalNote.template}
          values={clinicalNote.form}
          startClosed={true}
        />
      )}
    </>
  );
}
