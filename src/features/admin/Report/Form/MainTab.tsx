import { useFormikContext } from "formik";

import { Input, Select, Textarea } from "components/Inputs";
import { IReportFormBaseFields } from "./ReportForm";

export function MainTab() {
  const { values, errors, touched, setFieldValue } =
    useFormikContext<IReportFormBaseFields>();

  const activeOptions = [
    {
      value: true,
      label: "Ativo",
    },
    {
      value: false,
      label: "Inativo",
    },
  ];

  return (
    <>
      <div className={`form-row ${errors.name && touched.name ? "error" : ""}`}>
        <div className="form-label">
          <label>Nome:</label>
        </div>
        <div className="form-input">
          <Input
            onChange={({ target }) => setFieldValue("name", target.value)}
            value={values.name}
            maxLength={150}
            style={{ width: "100%" }}
          />
        </div>
        {errors.name && <div className="form-error">{errors.name}</div>}
      </div>

      <div
        className={`form-row ${
          errors.description && touched.description ? "error" : ""
        }`}
      >
        <div className="form-label">
          <label>Descrição:</label>
        </div>
        <div className="form-input">
          <Textarea
            onChange={({ target }) =>
              setFieldValue("description", target.value)
            }
            value={values.description}
            maxLength={250}
          />
        </div>
        {errors.description && (
          <div className="form-error">{errors.description}</div>
        )}
      </div>

      <div className={`form-row ${errors.sql && touched.sql ? "error" : ""}`}>
        <div className="form-label">
          <label>SQL:</label>
        </div>
        <div className="form-input">
          <Textarea
            onChange={({ target }) => setFieldValue("sql", target.value)}
            value={values.sql}
            rows={10}
          />
        </div>
        {errors.sql && <div className="form-error">{errors.sql}</div>}
      </div>

      <div
        className={`form-row ${errors.active && touched.active ? "error" : ""}`}
      >
        <div className="form-label">
          <label>Status:</label>
        </div>
        <div className="form-input">
          <Select
            optionFilterProp="label"
            showSearch
            value={values.active}
            onChange={(value) => setFieldValue("active", value)}
            allowClear
            options={activeOptions}
          />
        </div>
        {errors.active && <div className="form-error">{errors.active}</div>}
      </div>
    </>
  );
}
