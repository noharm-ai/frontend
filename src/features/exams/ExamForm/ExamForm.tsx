import { Formik, FormikHelpers } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { Dayjs } from "dayjs";

import { useAppSelector, useAppDispatch } from "src/store";
import DefaultModal from "components/Modal";
import notification from "components/notification";
import { setExamFormModal, createExam } from "./ExamFormSlice";
import {
  setExamsModalAdmissionNumber,
  clearExamsCache,
} from "../ExamModal/ExamModalSlice";
import { ExamFormBase } from "./ExamFormBase";
import { Form } from "styles/Form.style";
import { getErrorMessage } from "utils/errorHandler";
import { fetchScreeningThunk } from "src/store/ducks/prescriptions/thunk";

export interface IExamFormBaseFields {
  admissionNumber?: number;
  examType?: string;
  examDate?: Dayjs;
  result?: number;
}

export function ExamForm() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const admissionNumber = useAppSelector(
    (state) => state.examsForm.admissionNumber
  );
  const status = useAppSelector((state) => state.examsForm.status);
  const idPrescription = useAppSelector(
    (state) => (state.prescriptions?.single.data as any).idPrescription
  );
  const isSaving = status === "loading";

  const validationSchema = Yup.object().shape({
    examType: Yup.string().nullable().required(t("validation.requiredField")),
    examDate: Yup.string().nullable().required(t("validation.requiredField")),
    result: Yup.number().required(t("validation.requiredField")),
  });
  const initialValues: IExamFormBaseFields = {};

  const onSave = (
    params: IExamFormBaseFields,
    formikHelpers: FormikHelpers<IExamFormBaseFields>
  ) => {
    const payload = {
      admissionNumber: admissionNumber!,
      examType: params.examType!,
      examDate: params.examDate!.format("YYYY-MM-DDTHH:mm:ss"),
      result: params.result!,
    };

    dispatch(createExam(payload)).then((response: any) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        formikHelpers.resetForm();
        dispatch(setExamFormModal({ admissionNumber: null, idSegment: null }));
        notification.success({
          message: "Resultado de exame criado com sucesso!",
        });
        dispatch(setExamsModalAdmissionNumber(null));
        dispatch(clearExamsCache());
        if (idPrescription) {
          dispatch(fetchScreeningThunk(idPrescription));
        }
      }
    });
  };

  const onCancel = () => {
    dispatch(setExamFormModal({ admissionNumber: null, idSegment: null }));
  };

  return (
    <Formik
      enableReinitialize
      onSubmit={onSave}
      initialValues={initialValues}
      validationSchema={validationSchema}
      validateOnChange={false}
      validateOnBlur={false}
    >
      {({ handleSubmit }) => (
        <DefaultModal
          open={!!admissionNumber}
          width={500}
          centered
          destroyOnClose
          onCancel={onCancel}
          onOk={() => handleSubmit()}
          okText={t("actions.save")}
          cancelText={t("actions.cancel")}
          confirmLoading={isSaving}
          okButtonProps={{
            disabled: isSaving,
          }}
          cancelButtonProps={{
            disabled: isSaving,
          }}
          maskClosable={false}
        >
          <h2 className="modal-title">Adicionar Resultado de Exame</h2>

          <Form onSubmit={handleSubmit}>
            <ExamFormBase />
          </Form>
        </DefaultModal>
      )}
    </Formik>
  );
}
