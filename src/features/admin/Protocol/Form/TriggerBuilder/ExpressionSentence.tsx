import { Fragment, ReactNode } from "react";

import { ITriggerGroupNode, TriggerNode } from "./expressionTree";
import { SentenceCondition } from "./SentenceCondition";
import { LabelLookup, useItemLabels } from "./useItemLabels";
import { SentenceBox } from "./TriggerBuilder.style";

interface IExpressionSentenceProps {
  tree: ITriggerGroupNode;
  variables: any[];
}

const connectorWord = (connector: string, negated: boolean) => {
  if (connector === "and") {
    return negated ? "e também" : "e";
  }

  return negated ? "ou então" : "ou";
};

function groupHeadline(node: ITriggerGroupNode, count: number): string | null {
  if (count < 2) {
    return node.negated ? "nenhuma das condições abaixo se confirma" : null;
  }

  if (node.negated) {
    return node.connector === "and"
      ? "as condições abaixo não são todas atendidas"
      : "nenhuma das condições abaixo é atendida";
  }

  return node.connector === "and"
    ? "todas as condições abaixo são atendidas"
    : "pelo menos uma das condições abaixo é atendida";
}

function renderNode(
  node: TriggerNode,
  variables: any[],
  getLabel: LabelLookup,
  depth: number
): ReactNode | null {
  if (node.kind === "var") {
    if (!node.name) {
      return null;
    }

    return (
      <SentenceCondition
        node={node}
        variables={variables}
        getLabel={getLabel}
      />
    );
  }

  const parts = node.children
    .map((child, index) => ({
      key: index,
      content: renderNode(child, variables, getLabel, depth + 1),
    }))
    .filter((part) => part.content !== null);

  if (parts.length === 0) {
    return null;
  }

  const headline = groupHeadline(node, parts.length);
  const word = connectorWord(node.connector, node.negated);

  return (
    <div
      className={`sentence-group ${node.negated ? "is-negated" : ""}`}
      data-depth={depth}
    >
      {headline && (
        <div className="group-headline">
          {node.negated && <span className="group-not">NÃO</span>}
          {headline}:
        </div>
      )}
      <div className="group-items">
        {parts.map((part, index) => (
          <Fragment key={part.key}>
            {index > 0 && (
              <div className="sentence-connector">
                <span className={`connector-${node.connector}`}>{word}</span>
              </div>
            )}
            {part.content}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export function ExpressionSentence({
  tree,
  variables,
}: IExpressionSentenceProps) {
  const { getLabel, resolving } = useItemLabels(variables);
  const content = renderNode(tree, variables, getLabel, 0);

  if (!content) {
    return null;
  }

  return (
    <SentenceBox className="expression-sentence">
      <div className="sentence-title">
        O protocolo dispara quando
        {resolving && (
          <span className="sentence-loading">resolvendo descrições…</span>
        )}
      </div>
      {content}
    </SentenceBox>
  );
}
