import { Formik } from "formik";
import * as Yup from "yup";
import moment from "moment";
import { useTranslation } from "react-i18next";

import Alert from "components/Alert";
import { Row } from "components/Grid";
import notification from "components/notification";
import Heading from "components/Heading";
import DefaultModal from "components/Modal";
import { FormContainer } from "components/Forms/Form.style";
import { getErrorMessageFromException } from "utils/errorHandler";
import { getPatient, setPatient } from "utils/patientCache";
import PermissionService from "services/PermissionService";
import Permission from "models/Permission";
import { useAppDispatch, useAppSelector } from "store/index";

import { PatientFormBase } from "./PatientFormBase";
import { savePatientThunk } from "./PatientFormSlice";

const saveMessage = {
  message: "Uhu! Dados do paciente salvo com sucesso! :)",
};
const validationSchema = Yup.object().shape({
  weight: Yup.number().nullable(),
  height: Yup.number().nullable().min(3),
});

export function PatientForm({ afterSavePatient = () => {}, ...props }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isSaving = useAppSelector((state) => state.patientForm.save.isSaving);
  const {
    idPrescription,
    admissionNumber,
    weight,
    height,
    birthdate,
    skinColor,
    gender,
    observation,
    dialysis,
    notesInfo,
    notesInfoDate,
    dischargeDate,
    patient,
    idPatient,
  } = useAppSelector((state) => state.prescriptions.single.data);

  const initialValues = {
    idPrescription,
    admissionNumber,
    name: getPatient(idPatient)?.name ?? "",
    patientData: { ...(getPatient(idPatient)?.data ?? {}) },
    weight,
    height,
    observation,
    dialysis,
    birthdate,
    skinColor,
    gender,
    dischargeDate,
    lactating: patient?.lactating,
    pregnant: patient?.pregnant,
    tags: patient?.tags,
  };

  const submit = ({ name, patientData, ...params }) => {
    const payload = { ...params };
    if (PermissionService().has(Permission.WRITE_NAME) && name) {
      payload.name = { name, data: patientData };
    }
    // Not .unwrap(): the autoRefreshToken middleware wraps thunk dispatches
    // in a plain Promise, so the result has no unwrap method.
    dispatch(savePatientThunk(payload))
      .then((action) => {
        if (savePatientThunk.rejected.match(action)) {
          throw action.payload;
        }
        return savePatientThunk.fulfilled.match(action)
          ? action.payload
          : action;
      })
      .then((response) => {
        const existing = getPatient(idPatient);
        if (existing) {
          setPatient({
            ...existing,
            ...(PermissionService().has(Permission.WRITE_NAME) && name
              ? { name }
              : {}),
            data: { ...existing.data, ...patientData },
          });
        }
        notification.success(saveMessage);
        afterSavePatient(response?.data);
      })
      .catch((err) => {
        console.error("error", err);
        notification.error({
          message: t("error.title"),
          description: getErrorMessageFromException(err, t),
        });
      });
  };

  return (
    <Formik
      enableReinitialize
      onSubmit={submit}
      initialValues={initialValues}
      validationSchema={validationSchema}
    >
      {({ handleSubmit }) => (
        <DefaultModal
          centered
          destroyOnHidden
          {...props}
          onOk={handleSubmit}
          confirmLoading={isSaving}
          width="max(400px, 45vw)"
          cancelButtonProps={{
            disabled: isSaving,
            className: "gtm-bt-cancel-edit-patient",
          }}
        >
          <header>
            <Heading $margin="0 0 11px">Dados do paciente</Heading>
          </header>
          {notesInfo && (
            <Alert
              message={`NoHarm Care (${moment(notesInfoDate).format(
                "DD/MM/YYYY HH:mm",
              )})`}
              description={notesInfo}
              type="info"
              showIcon
            />
          )}
          <form onSubmit={handleSubmit}>
            <FormContainer>
              <Row type="flex" gutter={[16, 24]}>
                <PatientFormBase />
              </Row>
            </FormContainer>
          </form>
        </DefaultModal>
      )}
    </Formik>
  );
}
