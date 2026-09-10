import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Formik } from "formik";
import * as Yup from "yup";
import { Rate } from "antd";

import { useAppDispatch, useAppSelector } from "src/store";
import DefaultModal from "components/Modal";
import Alert from "components/Alert";
import notification from "components/notification";
import { getErrorMessage } from "utils/errorHandler";

import { Form } from "styles/Form.style";

import { saveDraft } from "features/memory/MemoryDraft/MemoryDraftSlice";
import {
  setSaveStatus,
  createNavigationDischargeSummary,
} from "../SummarySlice";
import { blocksToClinicalNotes } from "../verbalizers";

interface ISummaryNavigateProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  admissionNumber: string;
}

export function SummaryNavigate({
  open,
  setOpen,
  admissionNumber,
}: ISummaryNavigateProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const blocks = useAppSelector((state) => state.summary.blocks);
  const validationSchema = Yup.object().shape({
    rate: Yup.string().nullable().required(t("validation.requiredField")),
  });
  const initialValues = {
    rate: 0,
  };

  const rates = ["Péssima", "Ruim", "Boa", "Muito Boa", "Excelente"];

  const save = async (params: any) => {
    setLoading(true);
    const pageTimer = (window as any).noharm?.pageTimer;

    // save summary draft
    dispatch(
      // @ts-expect-error ts 2554 (legacy code)
      saveDraft({
        type: `summary_save_${admissionNumber}`,
        value: {
          admissionNumber,
          rate: params.rate,
          obs: params.obs,
          time: pageTimer?.getCurrentTime(),
          blocks,
        },
      }),
    );

    pageTimer?.reset();

    // send the discharge summary to the navigation schema
    const navigateResponse = await dispatch(
      // @ts-expect-error ts 2554 (legacy code)
      createNavigationDischargeSummary({
        admission_number: admissionNumber,
        clinical_notes: blocksToClinicalNotes(blocks),
      }),
    );

    setLoading(false);

    if (navigateResponse.error) {
      notification.error({
        message: getErrorMessage(navigateResponse, t),
      });
    } else {
      notification.success({
        message: "Sumário finalizado e enviado para navegação!",
        duration: 30,
      });

      setOpen(false);
      dispatch(setSaveStatus({ saveStatus: "saved" }));
    }
  };

  return (
    <Formik
      enableReinitialize
      onSubmit={save}
      initialValues={initialValues}
      validationSchema={validationSchema}
    >
      {({ handleSubmit, values, setFieldValue, errors, touched }) => (
        <DefaultModal
          width={"500px"}
          centered
          destroyOnHidden
          onOk={() => handleSubmit()}
          onCancel={() => setOpen(false)}
          open={open}
          cancelText={t("actions.cancel")}
          okText="Navegar paciente"
          confirmLoading={loading}
        >
          <header>
            <h2 className="modal-title">Navegar Paciente</h2>
          </header>
          <Alert
            type="warning"
            showIcon
            message="O paciente já deve existir na navegação"
            description="Esta ação envia somente o sumário de alta. Utilize a opção “Navegar Paciente” no menu da prescrição para copiar o paciente antes de enviar o sumário."
            style={{ marginBottom: "20px" }}
          />
          <Form>
            <div
              className={`form-row ${
                errors.rate && touched.rate ? "error" : ""
              }`}
            >
              <div className="form-label">
                <label>{t("summary.assessmentQuestion")}:</label>
              </div>
              <div className="form-input">
                <Rate
                  tooltips={rates}
                  onChange={(value) => setFieldValue("rate", value)}
                  value={values.rate}
                />
                {values.rate ? (
                  <span className="ant-rate-text">
                    {rates[values.rate - 1]}
                  </span>
                ) : (
                  ""
                )}
              </div>
              {errors.rate && touched.rate && (
                <div className="form-error">{errors.rate}</div>
              )}
            </div>
          </Form>
        </DefaultModal>
      )}
    </Formik>
  );
}
