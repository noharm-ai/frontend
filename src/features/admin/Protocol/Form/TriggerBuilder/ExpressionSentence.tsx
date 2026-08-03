import { Fragment, ReactNode } from "react";

import Tooltip from "components/Tooltip";
import { getVariableSummary } from "../variableSummary";
import {
  ITriggerGroupNode,
  ITriggerVarNode,
  TriggerNode,
} from "./expressionTree";
import { SentenceBox } from "./TriggerBuilder.style";

interface IExpressionSentenceProps {
  tree: ITriggerGroupNode;
  variables: any[];
}

function renderVar(node: ITriggerVarNode, variables: any[]): ReactNode {
  const variable = variables.find((v: any) => v.name === node.name);
  const summary = variable ? getVariableSummary(variable) : null;
  const label =
    summary && summary !== "(incompleta)" ? summary : node.name;

  return (
    <>
      {node.negated && <span className="sentence-not">não </span>}
      <Tooltip title={variable ? node.name : "Variável removida"}>
        <span className={`sentence-var ${variable ? "" : "is-dangling"}`}>
          {label}
        </span>
      </Tooltip>
    </>
  );
}

function renderNode(
  node: TriggerNode,
  variables: any[],
  isRoot: boolean
): ReactNode | null {
  if (node.kind === "var") {
    if (!node.name) {
      return null;
    }

    return renderVar(node, variables);
  }

  const parts = node.children
    .map((child, index) => ({
      key: index,
      kind: child.kind,
      content: renderNode(child, variables, false),
    }))
    .filter((part) => part.content !== null);

  if (parts.length === 0) {
    return null;
  }

  const connectorWord = node.connector === "and" ? "e" : "ou";
  const connectorClass =
    node.connector === "and" ? "sentence-and" : "sentence-or";

  // Groups that contain other groups break into one line per child,
  // indented, so nesting reads like an outline.
  const isBlock = parts.some((part) => part.kind === "group");

  if (!isBlock) {
    const joined = parts.map((part, index) => (
      <Fragment key={part.key}>
        {index > 0 && (
          <span className={connectorClass}> {connectorWord} </span>
        )}
        {part.content}
      </Fragment>
    ));

    const needsParens = node.negated || (!isRoot && parts.length > 1);

    if (!needsParens) {
      return <>{joined}</>;
    }

    return (
      <>
        {node.negated && <span className="sentence-not">não </span>}
        <span className="sentence-paren">(</span>
        {joined}
        <span className="sentence-paren">)</span>
      </>
    );
  }

  const lines = parts.map((part, index) => (
    <div className="sentence-line" key={part.key}>
      {index > 0 && (
        <span className={connectorClass}>{connectorWord} </span>
      )}
      {part.content}
    </div>
  ));

  if (isRoot && !node.negated) {
    return <div className="sentence-block">{lines}</div>;
  }

  return (
    <>
      {node.negated && <span className="sentence-not">não </span>}
      <span className="sentence-paren">(</span>
      <div className="sentence-block">{lines}</div>
      <span className="sentence-paren">)</span>
    </>
  );
}

export function ExpressionSentence({
  tree,
  variables,
}: IExpressionSentenceProps) {
  const content = renderNode(tree, variables, true);

  if (!content) {
    return null;
  }

  return (
    <SentenceBox className="expression-sentence">
      O protocolo dispara quando {content}
    </SentenceBox>
  );
}
