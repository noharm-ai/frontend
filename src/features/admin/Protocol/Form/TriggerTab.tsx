import { useCallback, useState } from "react";
import { useFormikContext } from "formik";
import { Alert, Tabs } from "antd";

import Card from "components/Card";
import { IProtocolFormBaseFields } from "./types";
import { parseTriggerExpression } from "components/ProtocolDescription/expressionTree";
import { TriggerBuilder } from "./TriggerBuilder/TriggerBuilder";
import { TriggerAdvanced } from "./TriggerBuilder/TriggerAdvanced";
import { ExpressionSentence } from "./TriggerBuilder/ExpressionSentence";
import { TriggerLayout } from "../Protocol.style";

type TriggerMode = "builder" | "advanced";

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
    <Card>
      <TriggerLayout>
        <Tabs
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
          ]}
        />
        <div className="trigger-result">
          <h4 className="trigger-result-title">Resultado</h4>
          <TriggerResult />
        </div>
      </TriggerLayout>
    </Card>
  );
}
