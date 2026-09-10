import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Formik } from "formik";
import * as Yup from "yup";

import { useAppDispatch } from "src/store";
import DefaultModal from "components/Modal";
import { Input } from "components/Inputs";
import notification from "components/notification";
import { getErrorMessage } from "utils/errorHandler";

import { Form } from "styles/Form.style";

import { navigatePatient } from "features/summary/SummarySlice";

interface IPrescriptionNavigateProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  admissionNumber: string;
  patientName?: string;
}

export function PrescriptionNavigate({
  open,
  setOpen,
  admissionNumber,
  patientName,
}: IPrescriptionNavigateProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const validationSchema = Yup.object().shape({
    name: Yup.string().nullable().required(t("validation.requiredField")),
    phone: Yup.string().nullable().required(t("validation.requiredField")),
  });
  const initialValues = {
    name: patientName || "",
    phone: "",
  };

  const navigate = async (params: any) => {
    setLoading(true);

    const navigateResponse = await dispatch(
      // @ts-expect-error ts 2554 (legacy code)
      navigatePatient({
        admission_number: admissionNumber,
        name: params.name,
        phone: params.phone,
        clinical_notes: {},
      }),
    );

    setLoading(false);

    if (navigateResponse.error) {
      notification.error({
        message: getErrorMessage(navigateResponse, t),
      });
    } else {
      notification.success({
        message: "Paciente copiado para navegação!",
        description:
          "A prescrição do paciente pode demorar até 5min para ser gerada",
        duration: 30,
      });

      setOpen(false);
    }
  };

  return (
    <Formik
      enableReinitialize
      onSubmit={navigate}
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
