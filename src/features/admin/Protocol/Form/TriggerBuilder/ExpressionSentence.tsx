import { ProtocolDescription } from "components/ProtocolDescription/ProtocolDescription";
import { ITriggerGroupNode } from "components/ProtocolDescription/expressionTree";
import { useItemLabels } from "./useItemLabels";

interface IExpressionSentenceProps {
  tree: ITriggerGroupNode;
  variables: any[];
}

/**
 * Editor-side sentence: the same renderer the prescription view uses, with item
 * descriptions resolved through the admin lookup endpoints and the technical
 * variable names kept visible.
 */
export function ExpressionSentence({
  tree,
  variables,
}: IExpressionSentenceProps) {
  const { getLabel, resolving } = useItemLabels(variables);

  return (
    <ProtocolDescription
      tree={tree}
      variables={variables}
      getLabel={getLabel}
      resolving={resolving}
      showVariableNames
    />
  );
}
