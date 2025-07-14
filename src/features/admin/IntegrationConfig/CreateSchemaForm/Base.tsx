import { useFormikContext } from "formik";

import { Input } from "components/Inputs";
import Switch from "src/components/Switch";
import { ICreateSchemaForm } from "./CreateSchemaForm";

export function Base() {
  const { values, errors, touched, setFieldValue } =
    useFormikContext<ICreateSchemaForm>();

  return (
    <>
      <div
        className={`form-row ${errors.schema && touched.schema ? "error" : ""}`}
      >
        <div className="form-label">
          <label>Schema:</label>
        </div>
        <div className="form-input">
          <Input
            onChange={({ target }) => setFieldValue("schema", target.value)}
            value={values.schema}
            style={{ width: "100%" }}
          />
        </div>
        {errors.schema && <div className="form-error">{errors.schema}</div>}
      </div>

      <div
        className={`form-row ${
          errors.is_cpoe && touched.is_cpoe ? "error" : ""
        }`}
      >
        <div className="form-label">
          <label>CPOE:</label>
        </div>
        <div className="form-input">
          <Switch
            onChange={(value: boolean) => setFieldValue("is_cpoe", value)}
            checked={values.is_cpoe}
          />
        </div>
        {errors.is_cpoe && <div className="form-error">{errors.is_cpoe}</div>}
      </div>

      <div
        className={`form-row ${errors.is_pec && touched.is_pec ? "error" : ""}`}
      >
        <div className="form-label">
          <label>PEC:</label>
        </div>
        <div className="form-input">
          <Switch
            onChange={(value: boolean) => setFieldValue("is_pec", value)}
            checked={values.is_pec}
          />
        </div>
        {errors.is_pec && <div className="form-error">{errors.is_pec}</div>}
      </div>

      {!values.is_pec && (
        <>
          <div
            className={`form-row ${
              errors.create_user && touched.create_user ? "error" : ""
            }`}
          >
            <div className="form-label">
              <label>Criar usuário de banco:</label>
            </div>
            <div className="form-input">
              <Switch
                onChange={(value: boolean) =>
                  setFieldValue("create_user", value)
                }
                checked={values.create_user}
              />
            </div>
            {errors.create_user && (
              <div className="form-error">{errors.create_user}</div>
            )}
          </div>

          {!values.create_user && (
            <div
              className={`form-row ${
                errors.db_user && touched.db_user ? "error" : ""
              }`}
            >
              <div className="form-label">
                <label>Nome do usuário de banco de dados:</label>
              </div>
              <div className="form-input">
                <Input
                  onChange={({ target }) =>
                    setFieldValue("db_user", target.value)
                  }
                  value={values.db_user}
                  style={{ width: "100%" }}
                />
              </div>
              <div className="form-info">
                Este usuário receberá permissão de acesso ao novo schema
              </div>
              {errors.db_user && (
                <div className="form-error">{errors.db_user}</div>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}
