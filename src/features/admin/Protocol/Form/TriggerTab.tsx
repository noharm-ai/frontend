import { useCallback, useState } from "react";
import { useFormikContext } from "formik";
import { Alert, Tabs } from "antd";

import { IProtocolFormBaseFields } from "./types";
import { parseTriggerExpression } from "components/ProtocolDescription/expressionTree";
import { TriggerBuilder } from "./TriggerBuilder/TriggerBuilder";
import { TriggerAdvanced } from "./TriggerBuilder/TriggerAdvanced";
import { ExpressionSentence } from "./TriggerBuilder/ExpressionSentence";

type TriggerMode = "builder" | "advanced" | "result";

function TriggerResult() {
  const { values } = useFormikContext<IProtocolFormBaseFields>();

  const result = parseTriggerExpression(values.config?.trigger ?? "");

  if (!result.tree) {
    return <Alert type="warning" showIcon message={result.error} />;
  }

  return (
    <ExpressionSentence
      tree={result.tree}
      variables={values.config?.variables ?? []}
    />
  );
}

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
          key: "advanced",
          label: "Avançado",
          children: (
            <TriggerAdvanced
              parseError={parseError}
              onTextChange={() => setParseError(null)}
            />
          ),
        },
        {
          key: "result",
          label: "Resultado",
          children: <TriggerResult />,
        },
      ]}
    />
  );
}
