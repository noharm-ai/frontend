import { useCallback, useState } from "react";
import { useFormikContext } from "formik";
import { Segmented } from "antd";

import { IProtocolFormBaseFields } from "./types";
import { parseTriggerExpression } from "./TriggerBuilder/expressionTree";
import { TriggerBuilder } from "./TriggerBuilder/TriggerBuilder";
import { TriggerAdvanced } from "./TriggerBuilder/TriggerAdvanced";

type TriggerMode = "builder" | "advanced";

export function TriggerTab() {
  const { values } = useFormikContext<IProtocolFormBaseFields>();

  const [parseError, setParseError] = useState<string | null>(null);
  const [mode, setMode] = useState<TriggerMode>(() =>
    parseTriggerExpression(values.config?.trigger ?? "").tree
      ? "builder"
      : "advanced"
  );

  const handleModeChange = (nextMode: TriggerMode) => {
    if (nextMode === mode) return;

    if (nextMode === "builder") {
      const result = parseTriggerExpression(values.config?.trigger ?? "");

      if (result.error) {
        setParseError(result.error);
        return;
      }
    }

    setParseError(null);
    setMode(nextMode);
  };

  const handleParseFailure = useCallback((error: string) => {
    setParseError(error);
    setMode("advanced");
  }, []);

  return (
    <>
      <div style={{ marginBottom: "12px" }}>
        <Segmented
          size="small"
          value={mode}
          options={[
            { label: "Visual", value: "builder" },
            { label: "Avançado", value: "advanced" },
          ]}
          onChange={(value) => handleModeChange(value as TriggerMode)}
        />
      </div>

      {mode === "builder" ? (
        <TriggerBuilder onParseFailure={handleParseFailure} />
      ) : (
        <TriggerAdvanced
          parseError={parseError}
          onTextChange={() => setParseError(null)}
        />
      )}
    </>
  );
}
