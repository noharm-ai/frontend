import { useRef } from "react";
import { useFormikContext } from "formik";
import { Alert } from "antd";
import { TextAreaRef } from "antd/es/input/TextArea";

import { Textarea } from "components/Inputs";
import Button from "components/Button";
import Tooltip from "components/Tooltip";
import { IProtocolFormBaseFields } from "../types";
import { getVariableSummary } from "../variableSummary";

interface ITriggerAdvancedProps {
  parseError: string | null;
  onTextChange: () => void;
}

export function TriggerAdvanced({
  parseError,
  onTextChange,
}: ITriggerAdvancedProps) {
  const textRef = useRef<TextAreaRef>(null);
  const { values, errors, setFieldValue } =
    useFormikContext<IProtocolFormBaseFields>();

  const insertSnippet = (snippet: string) => {
    const current = values.config?.trigger ?? "";
    const textArea = textRef.current?.resizableTextArea?.textArea;

    if (!textArea) {
      setFieldValue("config.trigger", current + snippet);
      onTextChange();
      return;
    }

    const start = textArea.selectionStart ?? current.length;
    const end = textArea.selectionEnd ?? current.length;
    const next = current.slice(0, start) + snippet + current.slice(end);
    const caret = start + snippet.length;

    setFieldValue("config.trigger", next);
    onTextChange();

    requestAnimationFrame(() => {
      const el = textRef.current?.resizableTextArea?.textArea;
      if (el) {
        el.focus();
        el.setSelectionRange(caret, caret);
      }
    });
  };

  return (
    <>
      {parseError && (
        <Alert
          type="error"
          showIcon
          message={`Não foi possível interpretar a expressão: ${parseError}`}
          style={{ marginBottom: "10px" }}
        />
      )}

      <div className={`form-row`}>
        <div className="form-label">
          <label>Expressão gatilho:</label>
        </div>
        <div className="form-input">
          <Textarea
            ref={textRef}
            onChange={({ target }) => {
              setFieldValue("config.trigger", target.value);
              onTextChange();
            }}
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
            <Tooltip key={v.name} title={getVariableSummary(v)}>
              <Button
                onClick={() => insertSnippet(`{{${v.name}}}`)}
                style={{ marginRight: "10px", marginBottom: "5px" }}
                type="primary"
              >
                {v.name}
              </Button>
            </Tooltip>
          ))}
        </div>
      </div>

      <div className={`form-row`}>
        <div className="form-label">
          <label>Operadores:</label>
        </div>
        <div className="form-input">
          <Button
            onClick={() => insertSnippet(` and `)}
            style={{ marginRight: "10px" }}
          >
            AND
          </Button>

          <Button
            onClick={() => insertSnippet(` or `)}
            style={{ marginRight: "10px" }}
          >
            OR
          </Button>

          <Button
            onClick={() => insertSnippet(` not `)}
            style={{ marginRight: "10px" }}
          >
            NOT
          </Button>

          <Button
            onClick={() => insertSnippet(` ( `)}
            style={{ marginRight: "10px" }}
          >
            {"("}
          </Button>
          <Button
            onClick={() => insertSnippet(` ) `)}
            style={{ marginRight: "10px" }}
          >
            {")"}
          </Button>
        </div>
      </div>
    </>
  );
}
