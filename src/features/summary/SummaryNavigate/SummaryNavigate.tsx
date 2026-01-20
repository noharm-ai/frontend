import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Formik } from "formik";
import * as Yup from "yup";
import { Rate } from "antd";

import { useAppDispatch, useAppSelector } from "src/store";
import DefaultModal from "components/Modal";
import { Input } from "components/Inputs";
import notification from "components/notification";
import { getErrorMessage } from "utils/errorHandler";

import { Form } from "styles/Form.style";

import { saveDraft } from "features/memory/MemoryDraft/MemoryDraftSlice";
import { setSaveStatus, navigatePatient } from "../SummarySlice";
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
  const summaryData = useAppSelector((state) => state.summary.data);
  const blocks = useAppSelector((state) => state.summary.blocks);
  const validationSchema = Yup.object().shape({
    rate: Yup.string().nullable().required(t("validation.requiredField")),
    name: Yup.string().nullable().required(t("validation.requiredField")),
    phone: Yup.string().nullable().required(t("validation.requiredField")),
  });
  const initialValues = {
    rate: 0,
    name: ((summaryData as any)?.patient?.name as string) || "",
    phone: "",
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
      })
    );

    pageTimer?.reset();

    //navigate

    const navigateResponse = await dispatch(
      // @ts-expect-error ts 2554 (legacy code)
      navigatePatient({
        admission_number: admissionNumber,
        name: params.name,
        phone: params.phone,
        clinical_notes: blocksToClinicalNotes(blocks),
      })
    );

    setLoading(false);

    if (navigateResponse.error) {
      notification.error({
        message: getErrorMessage(navigateResponse, t),
      });
    } else {
      notification.success({
        message: "Sumário finalizado e paciente copiado para navegação!",
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

            <div
              className={`form-row ${
                errors.name && touched.name ? "error" : ""
              }`}
            >
              <div className="form-label">
                <label>Nome do paciente:</label>
              </div>
              <div className="form-input">
                <Input
                  onChange={({ target }) => setFieldValue("name", target.value)}
                  value={values.name}
                />
              </div>
              {errors.name && touched.name && (
                <div className="form-error">{errors.name}</div>
              )}
            </div>

            <div
              className={`form-row ${
                errors.phone && touched.phone ? "error" : ""
              }`}
            >
              <div className="form-label">
                <label>Telefone do paciente:</label>
              </div>
              <div className="form-input">
                <Input
                  onChange={({ target }) =>
                    setFieldValue("phone", target.value)
                  }
                  value={values.phone}
                />
              </div>
              {errors.phone && touched.phone && (
                <div className="form-error">{errors.phone}</div>
              )}
            </div>
          </Form>
        </DefaultModal>
      )}
    </Formik>
  );
}
