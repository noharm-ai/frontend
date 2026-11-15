import type { ComponentProps } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import moment from "moment";
import { useTranslation } from "react-i18next";

import Alert from "components/Alert";
import notification from "components/notification";
import Heading from "components/Heading";
import DefaultModal from "components/Modal";
import { Form } from "styles/Form.style";
import { getErrorMessageFromException } from "utils/errorHandler";
import { getPatient, setPatient } from "utils/patientCache";
import PermissionService from "services/PermissionService";
import Permission from "models/Permission";
import { useAppDispatch, useAppSelector } from "store/index";

import { PatientFormBase } from "./PatientFormBase";
import type { IPatientFormValues } from "./PatientFormBase";
import { savePatientThunk } from "./PatientFormSlice";

const saveMessage = {
  message: "Uhu! Dados do paciente salvo com sucesso! :)",
};
const validationSchema = Yup.object().shape({
  weight: Yup.number().nullable(),
  height: Yup.number().nullable().min(3),
});

/** Fields of state.prescriptions.single.data (untyped legacy duck) read here. */
interface IPrescriptionPatientData {
  idPrescription?: number | string;
  admissionNumber: number | string;
  weight?: number | null;
  height?: number | null;
  birthdate?: string | null;
  skinColor?: string | null;
  gender?: string | null;
  observation?: string | null;
  dialysis?: string | null;
  notesInfo?: string | null;
  notesInfoDate?: string | null;
  dischargeDate?: string | null;
  patient?: {
    lactating?: boolean | null;
    pregnant?: boolean | null;
    tags?: string[] | null;
  } | null;
  idPatient: number | string;
}

type SavePatientAction =
  | ReturnType<typeof savePatientThunk.fulfilled>
  | ReturnType<typeof savePatientThunk.rejected>;

type PatientFormProps = Omit<
  ComponentProps<typeof DefaultModal>,
  "onOk" | "confirmLoading"
> & {
  afterSavePatient?: (data: unknown) => void;
};

export function PatientForm({
  afterSavePatient = () => {},
  ...props
}: PatientFormProps) {
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
  } = useAppSelector(
    (state) => state.prescriptions?.single.data as IPrescriptionPatientData,
  );

  const initialValues: IPatientFormValues = {
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

  const submit = ({ name, patientData, ...params }: IPatientFormValues) => {
    const payload: Parameters<typeof savePatientThunk>[0] = { ...params };
    if (PermissionService().has(Permission.WRITE_NAME) && name) {
      payload.name = { name, data: patientData };
    }
    // Not .unwrap(): the autoRefreshToken middleware wraps thunk dispatches
    // in a plain Promise, so the result has no unwrap method.
    dispatch(savePatientThunk(payload))
      .then((action: SavePatientAction) => {
        if (savePatientThunk.rejected.match(action)) {
          throw action.payload;
        }
        return savePatientThunk.fulfilled.match(action)
          ? action.payload
          : action;
      })
      .then((response: unknown) => {
        const savedData = (response as { data?: unknown } | undefined)?.data;
        const existing = getPatient(idPatient);
        if (existing) {
          setPatient({
            ...existing,
            ...(PermissionService().has(Permission.WRITE_NAME) && name
              ? { name }
              : {}),
            data: {
              ...(existing.data as Record<string, unknown> | undefined),
              ...patientData,
            },
          });
        }
        notification.success(saveMessage);
        afterSavePatient(savedData);
      })
      .catch((err: unknown) => {
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
          onOk={() => handleSubmit()}
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
          <Form
            onSubmit={handleSubmit}
            className="highlight-labels"
            data-kb="prescription.patientForm"
            style={{ marginTop: 20 }}
          >
            <PatientFormBase />
          </Form>
        </DefaultModal>
      )}
    </Formik>
  );
}
