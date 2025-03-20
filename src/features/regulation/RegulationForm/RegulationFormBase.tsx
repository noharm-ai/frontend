import { useFormikContext } from "formik";
import { Dayjs } from "dayjs";
import { useTranslation } from "react-i18next";

import { Select, Radio, DatePicker, Input } from "components/Inputs";
import Editor from "components/Editor";
import FieldNameAutocomplete from "features/fields/FieldNameAutocomplete/FieldNameAutocomplete";
import { IRegulationFormBaseFields } from "./RegulationForm";
import { useAppSelector } from "src/store";

interface IRegulationType {
  id: number;
  name: string;
  type: number;
}

export function RegulationFormBase() {
  const { t } = useTranslation();
  const { values, errors, setFieldValue } =
    useFormikContext<IRegulationFormBaseFields>();
  const departments = useAppSelector(
    (state) => state.lists.getSegmentDepartments.list
  );
  const departmentsStatus = useAppSelector(
    (state) => state.lists.getSegmentDepartments.status
  );
  const regulationTypes = useAppSelector(
    (state) => state.lists.regulation.types.list
  );
  const regulationTypesStatus = useAppSelector(
    (state) => state.lists.regulation.types.status
  );

  const typeOptionsNullable = [
    { label: "Exame", value: 1 },
    { label: "Encaminhamento", value: 2 },
    { label: "Todos", value: -1 },
  ];

  const filterTypes = (type: number, list: IRegulationType[]) => {
    if (!type || type === -1) {
      return list;
    }

    return list.filter((i) => {
      return type === i.type;
    });
  };

  const departmentList = departments.map(
    (d: { idDepartment: number; label: string }) => ({
      value: d.idDepartment,
      label: d.label,
    })
  );

  const regulationTypesList = filterTypes(
    values.typeType ?? -1,
    regulationTypes
  ).map((d: { id: number; name: string }) => ({
    value: d.id,
    label: `${d.name} (${d.id})`,
  }));

  const riskList = [1, 2, 3, 4].map((risk) => ({
    value: risk,
    label: t(`regulation.risk.risk_${risk}`),
  }));

  return (
    <>
      <div className={`form-row ${errors.idPatient ? "error" : ""}`}>
        <div className="form-label">
          <label>Paciente:</label>
        </div>
        <div className="form-input">
          <FieldNameAutocomplete
            onChange={(val: number) => setFieldValue("idPatient", val)}
            value={values.idPatient}
            mode=""
          />
        </div>
        {errors.idPatient && (
          <div className="form-error">{errors.idPatient}</div>
        )}
      </div>

      <div className={`form-row ${errors.idDepartment ? "error" : ""}`}>
        <div className="form-label">
          <label>UBS:</label>
        </div>
        <div className="form-input">
          <Select
            loading={departmentsStatus === "loading"}
            value={values.idDepartment}
            onChange={(value) => setFieldValue("idDepartment", value)}
            allowClear
            options={departmentList}
            showSearch
            optionFilterProp="label"
          />
        </div>
        {errors.idDepartment && (
          <div className="form-error">{errors.idDepartment}</div>
        )}
      </div>

      <div className={`form-row ${errors.idDepartment ? "error" : ""}`}>
        <div className="form-label">
          <label>Tipo:</label>
        </div>
        <div className="form-input">
          <Radio.Group
            options={typeOptionsNullable}
            onChange={({ target: { value } }) =>
              setFieldValue("typeType", value)
            }
            value={values.typeType}
          />
          <Select
            loading={regulationTypesStatus === "loading"}
            value={values.idRegSolicitationTypeList}
            onChange={(value) =>
              setFieldValue("idRegSolicitationTypeList", value)
            }
            allowClear
            options={regulationTypesList}
            showSearch
            optionFilterProp="label"
            mode="multiple"
            autoClearSearchValue={false}
          />
        </div>
        <div className="form-info">
          Cada tipo selecionado gera uma nova solicitação.
        </div>
        {errors.idRegSolicitationTypeList && (
          <div className="form-error">{errors.idRegSolicitationTypeList}</div>
        )}
      </div>

      <div className={`form-row ${errors.solicitationDate ? "error" : ""}`}>
        <div className="form-label">
          <label>Data da solicitação:</label>
        </div>
        <div className="form-input">
          <DatePicker
            format="DD/MM/YYYY HH:mm"
            value={values.solicitationDate}
            onChange={(value: Dayjs) => {
              setFieldValue("solicitationDate", value);
            }}
            popupClassName="noArrow"
            showTime
          />
        </div>
        {errors.solicitationDate && (
          <div className="form-error">{errors.solicitationDate}</div>
        )}
      </div>

      <div className={`form-row ${errors.risk ? "error" : ""}`}>
        <div className="form-label">
          <label>Risco:</label>
        </div>
        <div className="form-input">
          <Select
            value={values.risk}
            onChange={(val) => setFieldValue("risk", val)}
            showSearch
            optionFilterProp="label"
            allowClear
            options={riskList}
          />
        </div>
        {errors.risk && <div className="form-error">{errors.risk}</div>}
      </div>

      <div className={`form-row ${errors.attendant ? "error" : ""}`}>
        <div className="form-label">
          <label>Profissional solicitante:</label>
        </div>
        <div className="form-input">
          <Input
            value={values.attendant}
            onChange={({ target }) => setFieldValue("attendant", target.value)}
          />
        </div>
        {errors.attendant && (
          <div className="form-error">{errors.attendant}</div>
        )}
      </div>

      <div className={`form-row ${errors.attendantRecord ? "error" : ""}`}>
        <div className="form-label">
          <label>
            Registro do profissional solicitante (CRM, COREN, CRO...):
          </label>
        </div>
        <div className="form-input">
          <Input
            value={values.attendantRecord}
            onChange={({ target }) =>
              setFieldValue("attendantRecord", target.value)
            }
          />
        </div>
        {errors.attendantRecord && (
          <div className="form-error">{errors.attendantRecord}</div>
        )}
      </div>

      <div className={`form-row ${errors.justification ? "error" : ""}`}>
        <div className="form-label">
          <label>Justificativa:</label>
        </div>
        <div className="form-input">
          <Editor
            onEdit={(text: string) => setFieldValue("justification", text)}
            content={values.justification}
          />
        </div>
        {errors.justification && (
          <div className="form-error">{errors.justification}</div>
        )}
      </div>
    </>
  );
}
