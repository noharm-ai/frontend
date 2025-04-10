import { useFormikContext } from "formik";

import { Input } from "components/Inputs";
import { IProtocolFormBaseFields } from "./ProtocolForm";

export function BaseForm() {
  const { values, errors, touched, setFieldValue } =
    useFormikContext<IProtocolFormBaseFields>();

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
            style={{ width: "100%" }}
            disabled={!values.new}
          />
        </div>
        {errors.name && <div className="form-error">{errors.name}</div>}
      </div>
    </>
  );
}
