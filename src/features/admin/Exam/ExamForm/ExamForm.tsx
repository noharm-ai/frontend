import { useEffect } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";

import { useAppDispatch, useAppSelector } from "src/store";
import notification from "components/notification";
import DefaultModal from "components/Modal";
import { getErrorMessage } from "utils/errorHandler";
import { setExam, saveExam, fetchExam } from "./ExamFormSlice";
import { ExamFormBase } from "./ExamFormBase";
import { Form } from "styles/Form.style";
import { canWriteExamConfig } from "../examPermissions";
import { EXAM_FIELD_MAX, storedLength } from "../examFieldLength";

interface Props {
  onAfterSave?: (exam: any) => void;
}

export function ExamForm({ onAfterSave }: Props) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const data = useAppSelector((state) => state.admin.examForm.single.data);
  const status = useAppSelector((state) => state.admin.examForm.single.status);
  const canWrite = canWriteExamConfig();

  const maxStored = (max: number) =>
    Yup.string()
      .required(t("validation.requiredField"))
      .test("max-stored", t("validation.maxChars", { max }), (value) =>
        storedLength(value) <= max,
      );

  const validationSchema = Yup.object().shape({
    idSegment: Yup.string().required(t("validation.requiredField")),
    type: maxStored(EXAM_FIELD_MAX.type),
    name: maxStored(EXAM_FIELD_MAX.name),
    initials: maxStored(EXAM_FIELD_MAX.initials),
    ref: maxStored(EXAM_FIELD_MAX.ref),
    min: Yup.number().required(t("validation.requiredField")),
    max: Yup.number().required(t("validation.requiredField")),
  });

  useEffect(() => {
    if (data && !data.new && data.idSegment && data.type) {
      dispatch(fetchExam({ idSegment: data.idSegment, examType: data.type }));
    }
  }, [data?.idSegment, data?.type]); // eslint-disable-line

  const initialValues = {
    ...data,
  };

  const onSave = (params: any) => {
    dispatch(saveExam(params)).then((response: any) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        dispatch(setExam(null));
        onAfterSave?.(response.payload?.data?.data);
        notification.success({
          message: t("success.generic"),
        });
      }
    });
  };

  return (
    <Formik
      onSubmit={onSave}
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize
    >
      {({ handleSubmit }) => (
        <DefaultModal
          open={!!data}
          width={700}
          centered
          destroyOnHidden
          onOk={() => handleSubmit()}
          onCancel={() => dispatch(setExam(null))}
          confirmLoading={status === "loading"}
          okButtonProps={{
            disabled: status === "loading",
            style: canWrite ? undefined : { display: "none" },
          }}
          okText="Salvar"
          cancelButtonProps={{
            disabled: status === "loading",
          }}
          cancelText={canWrite ? undefined : t("actions.close")}
          maskClosable={false}
        >
          <header>
            <div className="modal-title">Exame</div>
          </header>

          <Form>
            <ExamFormBase />
          </Form>
        </DefaultModal>
      )}
    </Formik>
  );
}
