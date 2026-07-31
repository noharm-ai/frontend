import { useEffect, useRef, useState } from "react";
import { useFormikContext } from "formik";
import { Alert } from "antd";

import { IProtocolFormBaseFields } from "../types";
import {
  ITriggerGroupNode,
  TriggerNode,
  emptyGroup,
  parseTriggerExpression,
  serializeTriggerExpression,
  updateNodeAtPath,
  removeNodeAtPath,
  appendChildAtPath,
} from "./expressionTree";
import { ExpressionGroup } from "./ExpressionGroup";
import { TriggerPreview } from "./TriggerBuilder.style";

const MAX_TRIGGER_LENGTH = 500;

interface ITriggerBuilderProps {
  onParseFailure: (error: string) => void;
}

export function TriggerBuilder({ onParseFailure }: ITriggerBuilderProps) {
  const { values, errors, setFieldValue } =
    useFormikContext<IProtocolFormBaseFields>();

  const trigger = values.config?.trigger ?? "";
  const lastSyncedRef = useRef(trigger);

  const [tree, setTree] = useState<ITriggerGroupNode>(
    () => parseTriggerExpression(trigger).tree ?? emptyGroup()
  );

  // Resync when the trigger string changes outside the builder
  // (e.g. Formik enableReinitialize after the record loads).
  let externalParseError: string | null = null;
  if (trigger !== lastSyncedRef.current) {
    const result = parseTriggerExpression(trigger);

    if (result.tree) {
      lastSyncedRef.current = trigger;
      setTree(result.tree);
    } else {
      externalParseError = result.error;
    }
  }

  useEffect(() => {
    if (externalParseError) {
      onParseFailure(externalParseError);
    }
  }, [externalParseError, onParseFailure]);

  const mutate = (next: ITriggerGroupNode) => {
    const serialized = serializeTriggerExpression(next);

    lastSyncedRef.current = serialized;
    setTree(next);
    setFieldValue("config.trigger", serialized);
  };

  const handleUpdate = (
    path: number[],
    updater: (node: TriggerNode) => TriggerNode
  ) => mutate(updateNodeAtPath(tree, path, updater));

  const handleRemove = (path: number[]) => mutate(removeNodeAtPath(tree, path));

  const handleAddCondition = (path: number[]) =>
    mutate(
      appendChildAtPath(tree, path, { kind: "var", name: "", negated: false })
    );

  const handleAddGroup = (path: number[]) =>
    mutate(appendChildAtPath(tree, path, emptyGroup()));

  const variables = values.config?.variables ?? [];

  return (
    <>
      <ExpressionGroup
        node={tree}
        path={[]}
        variables={variables}
        onUpdate={handleUpdate}
        onRemove={handleRemove}
        onAddCondition={handleAddCondition}
        onAddGroup={handleAddGroup}
      />

      <TriggerPreview>
        <code>{trigger || "(expressão vazia)"}</code>
        <div
          className={`preview-counter ${
            trigger.length > MAX_TRIGGER_LENGTH ? "is-over" : ""
          }`}
        >
          {trigger.length}/{MAX_TRIGGER_LENGTH}
        </div>
      </TriggerPreview>

      {trigger.length > MAX_TRIGGER_LENGTH && (
        <Alert
          type="warning"
          showIcon
          message={`A expressão gerada excede ${MAX_TRIGGER_LENGTH} caracteres e será rejeitada pelo servidor.`}
          style={{ marginTop: "8px" }}
        />
      )}

      {errors.config?.trigger && (
        <div className="form-error">{errors.config?.trigger}</div>
      )}
    </>
  );
}
