import { Formik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";

import { useAppDispatch, useAppSelector } from "src/store";
import DefaultModal from "components/Modal";
import notification from "components/notification";
import { getErrorMessage } from "src/utils/errorHandler";
import { setReport, upsertReport, fetchReports } from "../ReportSlice";
import { BaseForm } from "./Base";

import { Form } from "styles/Form.style";

export interface IReportFormBaseFields {
  id?: number;
  name?: string;
  description?: string;
  sql?: string;
  active?: boolean;
  newReport?: boolean;
}

export function ReportForm() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const formData = useAppSelector((state) => state.admin.report.single.data);
  const status = useAppSelector((state) => state.admin.report.single.status);
  const isSaving = status === "loading";

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .nullable()
      .max(150, t("validation.maxLength", { max: 150 }))
      .required(t("validation.requiredField")),
    description: Yup.string()
      .nullable()
      .max(250, t("validation.maxLength", { max: 250 }))
      .required(t("validation.requiredField")),
    sql: Yup.string().nullable().required(t("validation.requiredField")),
    active: Yup.boolean().nullable().required(t("validation.requiredField")),
  });

  const initialValues = {
    ...formData,
  };

  const onSave = (params: IReportFormBaseFields) => {
    delete params.newReport;

    dispatch(upsertReport(params)).then((response: any) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        dispatch(setReport(null));
        dispatch(fetchReports({}));
        notification.success({
          message: t("success.generic"),
        });
      }
    });
  };

  const onCancel = () => {
    dispatch(setReport(null));
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
      {({
        handleSubmit,
        values,
      }: {
        handleSubmit: () => void;
        values: any;
      }) => (
        <DefaultModal
          open={formData}
          width={800}
          centered
          destroyOnHidden
          onCancel={onCancel}
          onOk={handleSubmit}
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
          <header>
            <h2 className="modal-title">
              {values.newReport ? "Novo Relatório" : values.name}
            </h2>
          </header>

          <Form onSubmit={handleSubmit}>
            <BaseForm formData={formData} />
          </Form>
        </DefaultModal>
      )}
    </Formik>
  );
}
