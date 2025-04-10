import { useFormikContext } from "formik";

import { Textarea } from "components/Inputs";
import { IProtocolFormBaseFields } from "./ProtocolForm";

export function TriggerTab() {
  const { values, setFieldValue } = useFormikContext<IProtocolFormBaseFields>();

  return (
    <>
      <div className={`form-row`}>
        <div className="form-input">
          <Textarea
            onChange={({ target }) =>
              setFieldValue("config.trigger", target.value)
            }
            value={values.config?.trigger}
          />
        </div>
      </div>
    </>
  );
}
