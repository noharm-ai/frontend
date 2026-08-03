import { useCallback, useState } from "react";
import { useFormikContext } from "formik";
import { Tabs } from "antd";

import { IProtocolFormBaseFields } from "./types";
import { parseTriggerExpression } from "./TriggerBuilder/expressionTree";
import { TriggerBuilder } from "./TriggerBuilder/TriggerBuilder";
import { TriggerAiAssistant } from "./TriggerBuilder/TriggerAiAssistant";
import { TriggerAdvanced } from "./TriggerBuilder/TriggerAdvanced";

type TriggerMode = "builder" | "ai" | "advanced";

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
    <Tabs
      className="side-panel-tabs"
      activeKey={mode}
      destroyOnHidden
      onChange={(key) => handleModeChange(key as TriggerMode)}
      items={[
        {
          key: "builder",
          label: "Visual",
          children: <TriggerBuilder onParseFailure={handleParseFailure} />,
        },
        {
          key: "ai",
          label: "Assistente IA",
          children: <TriggerAiAssistant />,
        },
        {
          key: "advanced",
          label: "Avançado",
          children: (
            <TriggerAdvanced
              parseError={parseError}
              onTextChange={() => setParseError(null)}
            />
          ),
        },
      ]}
    />
  );
}
