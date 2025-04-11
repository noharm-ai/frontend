import { useRef } from "react";
import { useFormikContext } from "formik";
import { TextAreaRef } from "antd/es/input/TextArea";

import { Textarea } from "components/Inputs";
import Button from "components/Button";
import { IProtocolFormBaseFields } from "./ProtocolForm";

export function TriggerTab() {
  const textRef = useRef<TextAreaRef>(null);
  const { values, errors, setFieldValue } =
    useFormikContext<IProtocolFormBaseFields>();

  const addVariable = (variable: string) => {
    let value = values.config?.trigger ?? "";

    value += variable;

    setFieldValue("config.trigger", value);
  };

  return (
    <>
      <div className={`form-row`}>
        <div className="form-label">
          <label>Expressão gatilho:</label>
        </div>
        <div className="form-input">
          <Textarea
            ref={textRef}
            onChange={({ target }) =>
              setFieldValue("config.trigger", target.value)
            }
            value={values.config?.trigger}
          />
        </div>
        {errors.config?.trigger && (
          <div className="form-error">{errors.config?.trigger}</div>
        )}
      </div>

      <div className={`form-row`}>
        <div className="form-label">
          <label>Variáveis disponíveis:</label>
        </div>
        <div className="form-input">
          {(values.config?.variables ?? []).map((v: any) => (
            <Button
              key={v.name}
              onClick={() => addVariable(`{{${v.name}}}`)}
              style={{ marginRight: "10px" }}
              type="primary"
            >
              {v.name}
            </Button>
          ))}
        </div>
      </div>

      <div className={`form-row`}>
        <div className="form-label">
          <label>Operadores:</label>
        </div>
        <div className="form-input">
          <Button
            onClick={() => addVariable(` and `)}
            style={{ marginRight: "10px" }}
          >
            AND
          </Button>

          <Button
            onClick={() => addVariable(` or `)}
            style={{ marginRight: "10px" }}
          >
            OR
          </Button>

          <Button
            onClick={() => addVariable(` not `)}
            style={{ marginRight: "10px" }}
          >
            NOT
          </Button>

          <Button
            onClick={() => addVariable(` ( `)}
            style={{ marginRight: "10px" }}
          >
            {"("}
          </Button>
          <Button
            onClick={() => addVariable(` ) `)}
            style={{ marginRight: "10px" }}
          >
            {")"}
          </Button>
        </div>
      </div>
    </>
  );
}
