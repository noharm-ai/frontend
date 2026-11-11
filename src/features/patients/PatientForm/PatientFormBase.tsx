import type { ReactNode } from "react";
import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import dayjs, { type Dayjs } from "dayjs";

import { Input, InputNumber, Select, DatePicker } from "components/Inputs";
import Editor from "components/Editor";
import { EditorBox } from "components/Forms/Form.style";
import PermissionService from "services/PermissionService";
import Permission from "models/Permission";
import { FieldTag } from "features/fields/FieldTag/FieldTag";
import { TagTypeEnum } from "models/TagTypeEnum";

export interface IPatientFormValues {
  idPrescription?: number | string;
  admissionNumber: number | string;
  name: string;
  patientData: Record<string, unknown>;
  weight?: number | null;
  height?: number | null;
  observation?: string | null;
  dialysis?: string | null;
  birthdate?: string | null;
  skinColor?: string | null;
  gender?: string | null;
  dischargeDate?: string | null;
  lactating?: boolean | null;
  pregnant?: boolean | null;
  tags?: string[] | null;
}

interface FormRowProps {
  label: ReactNode;
  htmlFor?: string;
  error?: ReactNode;
  info?: ReactNode;
  children: ReactNode;
}

const dialysisOptions = [
  { value: "c", label: "Contínua" },
  { value: "v", label: "Convencional" },
  { value: "x", label: "Estendida" },
  { value: "0", label: "Não realiza" },
  { value: "p", label: "Peritoneal" },
];

const genderOptions = [
  { value: "M", label: "Masculino" },
  { value: "F", label: "Feminino" },
];

const skinColorOptions = ["Amarela", "Branca", "Índio", "Negra", "Parda"].map(
  (value) => ({ value, label: value }),
);

const yesNoOptions = [
  { value: true, label: "Sim" },
  { value: false, label: "Não" },
];

function FormRow({ label, htmlFor, error, info, children }: FormRowProps) {
  return (
    <div className={`form-row ${error ? "error" : ""}`}>
      <div className="form-label">
        <label htmlFor={htmlFor}>{label}</label>
      </div>
      <div className="form-input">{children}</div>
      {error && <div className="form-error">{error}</div>}
      {info && <div className="form-info">{info}</div>}
    </div>
  );
}

export function PatientFormBase() {
  const { values, setFieldValue, errors } =
    useFormikContext<IPatientFormValues>();
  const {
    name,
    weight,
    height,
    observation,
    dialysis,
    gender,
    birthdate,
    skinColor,
    dischargeDate,
    lactating,
    pregnant,
  } = values;
  const { t } = useTranslation();
  const permission = PermissionService();

  return (
    <>
      {permission.has(Permission.WRITE_NAME) && (
        <>
          <FormRow label="Nome:" htmlFor="patient-name">
            <Input
              id="patient-name"
              value={name}
              onChange={(e) => setFieldValue("name", e.target.value)}
            />
          </FormRow>

          {Object.entries(values.patientData ?? {})
            .filter(([key]) => key !== "cache")
            .map(([key, value]) => (
              <FormRow
                key={key}
                label={`${t(`patientDetails.${key}`, { defaultValue: key })}:`}
                htmlFor={`patient-data-${key}`}
              >
                <Input
                  id={`patient-data-${key}`}
                  value={(value ?? "") as string}
                  onChange={(e) =>
                    setFieldValue("patientData", {
                      ...values.patientData,
                      [key]: e.target.value,
                    })
                  }
                />
              </FormRow>
            ))}
        </>
      )}

      <div className="form-row form-row-flex">
        <FormRow label="Peso:" htmlFor="patient-weight" error={errors.weight}>
          <InputNumber
            id="patient-weight"
            style={{ width: "100%" }}
            min={0}
            max={99999}
            suffix="kg"
            value={weight}
            status={errors.weight ? "error" : undefined}
            onChange={(value: number | null) => setFieldValue("weight", value)}
          />
        </FormRow>

        <FormRow
          label="Altura:"
          htmlFor="patient-height"
          error={errors.height && "Altura deve ser especificada em centímetros"}
        >
          <InputNumber
            id="patient-height"
            style={{ width: "100%" }}
            min={0}
            max={99999}
            suffix="cm"
            value={height}
            status={errors.height ? "error" : undefined}
            onChange={(value: number | null) => setFieldValue("height", value)}
          />
        </FormRow>
      </div>

      <div className="form-row form-row-flex">
        <FormRow label={`${t("labels.gender")}:`} htmlFor="patient-gender">
          <Select
            id="patient-gender"
            options={genderOptions}
            value={gender}
            onChange={(value) => setFieldValue("gender", value)}
            allowClear
          />
        </FormRow>

        <FormRow
          label={`${t("labels.skinColor")}:`}
          htmlFor="patient-skin-color"
        >
          <Select
            id="patient-skin-color"
            options={skinColorOptions}
            value={skinColor}
            onChange={(value) => setFieldValue("skinColor", value)}
            allowClear
          />
        </FormRow>
      </div>

      <div className="form-row form-row-flex">
        <FormRow
          label={`${t("labels.birthdate")}:`}
          htmlFor="patient-birthdate"
        >
          <DatePicker
            id="patient-birthdate"
            format="DD/MM/YYYY"
            value={birthdate ? dayjs(birthdate) : null}
            onChange={(value: Dayjs | null) =>
              setFieldValue(
                "birthdate",
                value ? value.format("YYYY-MM-DD") : null,
              )
            }
            allowClear
            style={{ width: "100%" }}
          />
        </FormRow>

        <FormRow label={`${t("labels.dialysis")}:`} htmlFor="patient-dialysis">
          <Select
            id="patient-dialysis"
            options={dialysisOptions}
            value={dialysis}
            onChange={(value) => setFieldValue("dialysis", value)}
            allowClear
          />
        </FormRow>
      </div>

      <div className="form-row form-row-flex">
        <FormRow
          label={`${t("labels.lactating")}:`}
          htmlFor="patient-lactating"
        >
          <Select
            id="patient-lactating"
            options={yesNoOptions}
            value={lactating}
            onChange={(value) => setFieldValue("lactating", value)}
          />
        </FormRow>

        <FormRow label={`${t("labels.pregnant")}:`} htmlFor="patient-pregnant">
          <Select
            id="patient-pregnant"
            options={yesNoOptions}
            value={pregnant}
            onChange={(value) => setFieldValue("pregnant", value)}
          />
        </FormRow>
      </div>

      <FormRow
        label="Marcadores:"
        htmlFor="patient-tags"
        info="Selecione um marcador existente ou digite e pressione enter para adicionar um novo"
      >
        <FieldTag
          id="patient-tags"
          mode="tags"
          style={{ width: "100%" }}
          onChange={(v: string[]) => setFieldValue("tags", v)}
          value={values.tags}
          maxCount={10}
          tagType={TagTypeEnum.PATIENT}
        />
      </FormRow>

      {permission.hasAny([Permission.ADMIN_PATIENT, Permission.READ_NAV]) && (
        <FormRow
          label={`${t("labels.dischargeDate")}:`}
          htmlFor="patient-discharge-date"
          info="*Campo editável somente para equipe NoHarm"
        >
          <DatePicker
            id="patient-discharge-date"
            format="DD/MM/YYYY HH:mm"
            value={dischargeDate ? dayjs(dischargeDate) : null}
            onChange={(value: Dayjs | null) =>
              setFieldValue(
                "dischargeDate",
                value ? value.format("YYYY-MM-DD HH:mm") : null,
              )
            }
            allowClear
            showTime
            style={{ width: "100%" }}
          />
        </FormRow>
      )}

      <FormRow label="Anotações:">
        <EditorBox>
          <Editor
            onEdit={(value) => setFieldValue("observation", value)}
            content={observation || ""}
          />
        </EditorBox>
      </FormRow>
    </>
  );
}
